import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				try {
					// Dynamic imports to avoid bundling for client
					const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
					const { env } = await import("@/env");
					const { getMediaCollection } = await import("@/lib/db/collections");

					// Extract the file key from the URL path
					const url = new URL(request.url);
					const pathParts = url.pathname.split("/api/media/");
					const key = pathParts[1];

					if (!key) {
						return new Response("File key is required", { status: 400 });
					}

					// Decode the key in case it has URL-encoded characters
					const decodedKey = decodeURIComponent(key);

					// Create S3 client
					let endpoint = env.S3_ENDPOINT;
					const region = env.S3_REGION;
					const accessKeyId = env.S3_ACCESS_KEY_ID;
					const secretAccessKey = env.S3_SECRET_ACCESS_KEY;
					const bucket = env.S3_BUCKET_NAME;

					if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
						return new Response("S3 not configured", { status: 500 });
					}

					if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
						endpoint = `https://${endpoint}`;
					}

					const client = new S3Client({
						endpoint,
						region,
						credentials: {
							accessKeyId,
							secretAccessKey,
						},
						forcePathStyle: true,
					});

					// Get file from S3
					const command = new GetObjectCommand({
						Bucket: bucket,
						Key: decodedKey,
					});

					const s3Response = await client.send(command);

					if (!s3Response.Body) {
						return new Response("File not found", { status: 404 });
					}

					// Get metadata from MongoDB for noindex status
					const mediaCollection = await getMediaCollection();
					const metadata = await mediaCollection.findOne({ s3Key: decodedKey });
					const noindex = metadata?.noindex ?? false;

					// Convert the S3 stream to a web ReadableStream
					const stream = s3Response.Body.transformToWebStream();

					// Build response headers
					const headers = new Headers();

					// Set Content-Type from S3 metadata
					if (s3Response.ContentType) {
						headers.set("Content-Type", s3Response.ContentType);
					}

					// Set Content-Length if available
					if (s3Response.ContentLength) {
						headers.set("Content-Length", s3Response.ContentLength.toString());
					}

					// Set Cache-Control for browser/CDN caching (1 year for immutable assets)
					headers.set("Cache-Control", "public, max-age=31536000, immutable");

					// Set X-Robots-Tag if noindex is enabled
					if (noindex) {
						headers.set("X-Robots-Tag", "noindex, nofollow");
					}

					return new Response(stream, {
						status: 200,
						headers,
					});
				} catch (error: unknown) {
					console.error("[Media Proxy] Error:", error);

					// Check for S3 not found errors
					if (error && typeof error === "object" && "name" in error) {
						const s3Error = error as { name: string };
						if (s3Error.name === "NoSuchKey") {
							return new Response("File not found", { status: 404 });
						}
					}

					return new Response("Internal server error", { status: 500 });
				}
			},
		},
	},
});


