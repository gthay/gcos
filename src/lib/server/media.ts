import { createServerFn } from "@tanstack/react-start";
import {
	S3Client,
	ListObjectsV2Command,
	DeleteObjectCommand,
	PutObjectCommand,
	type _Object,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { env } from "@/env";
import {
	getMediaCollection,
	getProjectsCollection,
	getTeamMembersCollection,
	getCoursesCollection,
	getBlogPostsCollection,
} from "@/lib/db/collections";

// Image types that should be converted to WebP
const OPTIMIZABLE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Optimize image using Sharp - convert to WebP with compression
async function optimizeImage(
	buffer: Buffer,
	contentType: string
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
	// Only optimize supported image types
	if (!OPTIMIZABLE_IMAGE_TYPES.includes(contentType)) {
		const extension = contentType.split("/")[1] || "bin";
		return { buffer, contentType, extension };
	}

	// Convert to WebP with quality 80 (good balance between quality and size)
	// Also resize if image is larger than 1920px wide (common max width)
	const optimizedBuffer = await sharp(buffer)
		.resize(1920, null, { withoutEnlargement: true }) // Max 1920px wide, keep aspect ratio
		.webp({ quality: 80 })
		.toBuffer();

	return {
		buffer: optimizedBuffer,
		contentType: "image/webp",
		extension: "webp",
	};
}

// Create S3 client on each request to ensure fresh env vars in dev
function getS3Client(): S3Client {
	let endpoint = env.S3_ENDPOINT;
	const region = env.S3_REGION;
	const accessKeyId = env.S3_ACCESS_KEY_ID;
	const secretAccessKey = env.S3_SECRET_ACCESS_KEY;

	if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
		throw new Error("S3 configuration is incomplete. Check environment variables.");
	}

	// Ensure endpoint has https:// prefix
	if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
		endpoint = `https://${endpoint}`;
	}

	return new S3Client({
		endpoint,
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		forcePathStyle: true, // Required for Hetzner S3
	});
}

export interface MediaUsage {
	type: "project" | "teamMember" | "course" | "blogPost";
	name: string;
	id: string;
}

export interface S3File {
	key: string;
	name: string;
	size: number;
	lastModified: string;
	type: string;
	url: string;
	noindex: boolean;
	usedBy: MediaUsage[];
}

function getFileType(key: string): string {
	const ext = key.split(".").pop()?.toLowerCase() || "";
	const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp"];
	const videoExts = ["mp4", "webm", "mov", "avi", "mkv"];
	const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];
	const docExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md"];
	const archiveExts = ["zip", "rar", "7z", "tar", "gz"];

	if (imageExts.includes(ext)) return "image";
	if (videoExts.includes(ext)) return "video";
	if (audioExts.includes(ext)) return "audio";
	if (docExts.includes(ext)) return "document";
	if (archiveExts.includes(ext)) return "archive";
	return "other";
}

function getFileName(key: string): string {
	return key.split("/").pop() || key;
}

function getFileUrl(key: string): string {
	// Use SEO-friendly URL if MEDIA_BASE_URL is configured
	const mediaBaseUrl = env.MEDIA_BASE_URL;
	if (mediaBaseUrl) {
		// Remove trailing slash if present
		const baseUrl = mediaBaseUrl.replace(/\/+$/, "");
		return `${baseUrl}/${key}`;
	}

	// Fallback to direct S3 URL
	let endpoint = env.S3_ENDPOINT;
	const bucket = env.S3_BUCKET_NAME;
	if (!endpoint || !bucket) return "";

	// Ensure endpoint has https:// prefix for URL construction
	if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
		endpoint = `https://${endpoint}`;
	}

	// Construct public URL for Hetzner S3
	// Format: https://bucket.endpoint/key
	const endpointUrl = new URL(endpoint);
	return `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${key}`;
}

// Extract the S3 key from a full URL
function extractKeyFromUrl(url: string): string | null {
	if (!url) return null;
	// Handle various URL formats:
	// - https://example.com/api/media/filename.webp -> filename.webp
	// - https://media.example.com/filename.webp -> filename.webp
	// - https://bucket.s3.endpoint/filename.webp -> filename.webp
	// - /api/media/filename.webp -> filename.webp
	// - filename.webp -> filename.webp
	try {
		// Remove /api/media/ prefix if present (handles both absolute and relative URLs)
		let cleanUrl = url.replace(/^.*\/api\/media\//, "");

		// If it's still a full URL, extract the pathname
		if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
			const urlObj = new URL(cleanUrl);
			cleanUrl = urlObj.pathname.replace(/^\//, "");
		}

		// Remove any leading slashes
		cleanUrl = cleanUrl.replace(/^\/+/, "");

		return cleanUrl || null;
	} catch {
		// If parsing fails, try to extract just the filename
		const match = url.match(/([^/]+)$/);
		return match ? match[1] : url;
	}
}

// Build a map of which files are used where
async function buildMediaUsageMap(): Promise<Map<string, MediaUsage[]>> {
	const usageMap = new Map<string, MediaUsage[]>();

	const addUsage = (url: string | undefined, usage: MediaUsage) => {
		if (!url) return;
		const key = extractKeyFromUrl(url);
		if (!key) return;
		const existing = usageMap.get(key) || [];
		existing.push(usage);
		usageMap.set(key, existing);
	};

	// Query all collections in parallel
	const [projects, teamMembers, courses, blogPosts] = await Promise.all([
		getProjectsCollection().then((c) => c.find({}).toArray()),
		getTeamMembersCollection().then((c) => c.find({}).toArray()),
		getCoursesCollection().then((c) => c.find({}).toArray()),
		getBlogPostsCollection().then((c) => c.find({}).toArray()),
	]);

	// Check projects (logo field)
	for (const project of projects) {
		addUsage(project.logo, {
			type: "project",
			name: project.name,
			id: project._id?.toString() || "",
		});
	}

	// Check team members (picture field)
	for (const member of teamMembers) {
		addUsage(member.picture, {
			type: "teamMember",
			name: member.name,
			id: member._id?.toString() || "",
		});
	}

	// Check courses (featuredImage and hosts[].image)
	for (const course of courses) {
		addUsage(course.featuredImage, {
			type: "course",
			name: course.h1,
			id: course._id?.toString() || "",
		});
		// Also check host images
		if (course.hosts) {
			for (const host of course.hosts) {
				addUsage(host.image, {
					type: "course",
					name: `${course.h1} (Host: ${host.title})`,
					id: course._id?.toString() || "",
				});
			}
		}
	}

	// Check blog posts (thumbnail field)
	for (const post of blogPosts) {
		addUsage(post.thumbnail, {
			type: "blogPost",
			name: post.h1,
			id: post._id?.toString() || "",
		});
	}

	return usageMap;
}

export const getFiles = createServerFn({ method: "GET" }).handler(async () => {
	const client = getS3Client();
	const bucket = env.S3_BUCKET_NAME;

	if (!bucket) {
		throw new Error("S3_BUCKET_NAME is not configured");
	}

	try {
		const command = new ListObjectsV2Command({
			Bucket: bucket,
		});

		// Fetch S3 files, metadata, and usage map in parallel
		const [response, mediaCollection, usageMap] = await Promise.all([
			client.send(command),
			getMediaCollection(),
			buildMediaUsageMap(),
		]);

		const contents = response.Contents || [];
		const allMetadata = await mediaCollection.find({}).toArray();
		const metadataMap = new Map(allMetadata.map((m) => [m.s3Key, m]));

		const files: S3File[] = contents
			.filter((obj): obj is _Object & { Key: string } => !!obj.Key && !obj.Key.endsWith("/"))
			.map((obj) => {
				const metadata = metadataMap.get(obj.Key);
				return {
					key: obj.Key,
					name: getFileName(obj.Key),
					size: obj.Size || 0,
					lastModified: obj.LastModified?.toISOString() || "",
					type: getFileType(obj.Key),
					url: getFileUrl(obj.Key),
					noindex: metadata?.noindex ?? false,
					usedBy: usageMap.get(obj.Key) || [],
				};
			});

		return files;
	} catch (error: unknown) {
		console.error("[S3] Error:", error);
		// Provide more helpful error messages
		if (error && typeof error === "object" && "Code" in error) {
			const s3Error = error as { Code: string; message?: string };
			if (s3Error.Code === "NoSuchBucket") {
				throw new Error(`Bucket "${bucket}" does not exist. Please create it in your Hetzner Object Storage console.`);
			}
			if (s3Error.Code === "AccessDenied") {
				throw new Error("Access denied. Check your S3 credentials.");
			}
			if (s3Error.Code === "InvalidAccessKeyId") {
				throw new Error("Invalid access key. Check S3_ACCESS_KEY_ID.");
			}
			if (s3Error.Code === "SignatureDoesNotMatch") {
				throw new Error("Invalid secret key. Check S3_SECRET_ACCESS_KEY.");
			}
		}
		throw error;
	}
});

export const deleteFile = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => input as string)
	.handler(async ({ data: key }) => {
		const client = getS3Client();
		const bucket = env.S3_BUCKET_NAME;

		if (!bucket) {
			throw new Error("S3_BUCKET_NAME is not configured");
		}

		// Check if file is in use
		const usageMap = await buildMediaUsageMap();
		const usage = usageMap.get(key);

		if (usage && usage.length > 0) {
			const usageList = usage
				.map((u) => `${u.type}: ${u.name}`)
				.join(", ");
			throw new Error(
				`Cannot delete: This file is used by ${usage.length} item(s): ${usageList}`
			);
		}

		// Delete from S3
		const command = new DeleteObjectCommand({
			Bucket: bucket,
			Key: key,
		});

		await client.send(command);

		// Also delete metadata from MongoDB
		const mediaCollection = await getMediaCollection();
		await mediaCollection.deleteOne({ s3Key: key });

		return true;
	});

interface UploadFileInput {
	fileName: string;
	fileData: string; // Base64 encoded file data
	contentType: string;
}

export const uploadFile = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => input as UploadFileInput)
	.handler(async ({ data }) => {
		const client = getS3Client();
		const bucket = env.S3_BUCKET_NAME;

		if (!bucket) {
			throw new Error("S3_BUCKET_NAME is not configured");
		}

		const { fileName, fileData, contentType } = data;

		// Decode base64 data
		const originalBuffer = Buffer.from(fileData, "base64");

		// Optimize image if it's a supported type
		const optimized = await optimizeImage(originalBuffer, contentType);

		// Sanitize filename and update extension if image was converted
		const baseName = fileName
			.replace(/\.[^/.]+$/, "") // Remove original extension
			.replace(/[^a-zA-Z0-9._-]/g, "_")
			.toLowerCase();

		const key = `${baseName}.${optimized.extension}`;

		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: optimized.buffer,
			ContentType: optimized.contentType,
		});

		try {
			await client.send(command);

			// Log optimization results for images
			if (OPTIMIZABLE_IMAGE_TYPES.includes(contentType)) {
				const savedBytes = originalBuffer.length - optimized.buffer.length;
				const savedPercent = Math.round((savedBytes / originalBuffer.length) * 100);
				console.log(
					`[Media] Optimized ${fileName}: ${(originalBuffer.length / 1024).toFixed(1)}KB → ${(optimized.buffer.length / 1024).toFixed(1)}KB (saved ${savedPercent}%)`
				);
			}

			// Create metadata in MongoDB with default noindex: false
			const mediaCollection = await getMediaCollection();
			await mediaCollection.updateOne(
				{ s3Key: key },
				{
					$set: {
						s3Key: key,
						noindex: false,
						updatedAt: new Date(),
					},
					$setOnInsert: {
						createdAt: new Date(),
					},
				},
				{ upsert: true }
			);

			return {
				success: true,
				key,
				url: getFileUrl(key),
				name: getFileName(key),
				size: optimized.buffer.length,
				type: getFileType(key),
				noindex: false,
			};
		} catch (error: unknown) {
			console.error("[S3] Upload error:", error);
			if (error && typeof error === "object" && "Code" in error) {
				const s3Error = error as { Code: string; message?: string };
				if (s3Error.Code === "AccessDenied") {
					throw new Error("Access denied. Check your S3 credentials and bucket permissions.");
				}
			}
			throw error;
		}
	});

interface UpdateNoindexInput {
	s3Key: string;
	noindex: boolean;
}

export const updateMediaNoindex = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => input as UpdateNoindexInput)
	.handler(async ({ data }) => {
		const { s3Key, noindex } = data;

		const mediaCollection = await getMediaCollection();
		await mediaCollection.updateOne(
			{ s3Key },
			{
				$set: {
					s3Key,
					noindex,
					updatedAt: new Date(),
				},
				$setOnInsert: {
					createdAt: new Date(),
				},
			},
			{ upsert: true }
		);

		return { success: true, s3Key, noindex };
	});
