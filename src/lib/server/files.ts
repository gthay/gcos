import { createServerFn } from "@tanstack/react-start";
import {
	S3Client,
	ListObjectsV2Command,
	DeleteObjectCommand,
	PutObjectCommand,
	type _Object,
} from "@aws-sdk/client-s3";
import { env } from "@/env";

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

export interface S3File {
	key: string;
	name: string;
	size: number;
	lastModified: string;
	type: string;
	url: string;
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

export const getFiles = createServerFn({ method: "GET" }).handler(async () => {
	const client = getS3Client();
	const bucket = env.S3_BUCKET_NAME;

	if (!bucket) {
		throw new Error("S3_BUCKET_NAME is not configured");
	}

	// Debug: log the bucket name
	console.log("[S3] Attempting to list files from bucket:", bucket);

	try {
		const command = new ListObjectsV2Command({
			Bucket: bucket,
		});

		const response = await client.send(command);
		const contents = response.Contents || [];

		const files: S3File[] = contents
			.filter((obj): obj is _Object & { Key: string } => !!obj.Key && !obj.Key.endsWith("/"))
			.map((obj) => ({
				key: obj.Key,
				name: getFileName(obj.Key),
				size: obj.Size || 0,
				lastModified: obj.LastModified?.toISOString() || "",
				type: getFileType(obj.Key),
				url: getFileUrl(obj.Key),
			}));

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

		const command = new DeleteObjectCommand({
			Bucket: bucket,
			Key: key,
		});

		await client.send(command);
		return true;
	});

interface UploadFileInput {
	fileName: string;
	fileData: string; // Base64 encoded file data
	contentType: string;
	folder?: string; // Optional folder path
}

export const uploadFile = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => input as UploadFileInput)
	.handler(async ({ data }) => {
		const client = getS3Client();
		const bucket = env.S3_BUCKET_NAME;

		if (!bucket) {
			throw new Error("S3_BUCKET_NAME is not configured");
		}

		const { fileName, fileData, contentType, folder } = data;

		// Sanitize filename - remove special characters but keep extension
		const sanitizedFileName = fileName
			.replace(/[^a-zA-Z0-9._-]/g, "_")
			.toLowerCase();

		// Create the key with optional folder prefix
		const key = folder
			? `${folder.replace(/^\/+|\/+$/g, "")}/${sanitizedFileName}`
			: sanitizedFileName;

		// Decode base64 data
		const buffer = Buffer.from(fileData, "base64");

		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		});

		try {
			await client.send(command);
			return {
				success: true,
				key,
				url: getFileUrl(key),
				name: getFileName(key),
				size: buffer.length,
				type: getFileType(key),
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

