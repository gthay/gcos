import { z } from "zod";

// Client-safe schema (no MongoDB dependencies)
export const mediaMetadataCreateSchema = z.object({
	s3Key: z.string().min(1, "S3 key is required"),
	noindex: z.boolean().default(false),
});

export type MediaMetadataCreate = z.infer<typeof mediaMetadataCreateSchema>;

// Server-only schema with MongoDB ObjectId
// This is only imported on the server side
export async function getMediaMetadataSchema() {
	// Dynamic import to avoid bundling MongoDB on client
	const { ObjectId } = await import("mongodb");
	return z.object({
		_id: z.instanceof(ObjectId).optional(),
		s3Key: z.string().min(1, "S3 key is required"),
		noindex: z.boolean().default(false),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	});
}

// Type for server-side MediaMetadata
export type MediaMetadata = {
	_id?: string;
	s3Key: string;
	noindex: boolean;
	createdAt?: Date;
	updatedAt?: Date;
};


