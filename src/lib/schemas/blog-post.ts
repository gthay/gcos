import { z } from "zod";

// Client-safe schema (no MongoDB dependencies)
// This is used for form validation on the client side
export const blogPostCreateSchema = z.object({
	metaTitle: z.string().min(1, "Meta title is required"),
	metaDescription: z.string().min(1, "Meta description is required"),
	h1: z.string().min(1, "H1 is required"),
	intro: z.string().min(1, "Intro is required"),
	body: z.string().min(1, "Body is required"),
	category: z.string().min(1, "Category is required"),
	author: z.string().min(1, "Author is required"),
	thumbnail: z.string().url("Thumbnail must be a valid URL").optional().or(z.literal("")),
});

export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>;

// Server-only schema with MongoDB ObjectId
// This is only imported on the server side
export async function getBlogPostSchema() {
	// Dynamic import to avoid bundling MongoDB on client
	const { ObjectId } = await import("mongodb");
	return z.object({
		_id: z.instanceof(ObjectId).optional(),
		metaTitle: z.string().min(1, "Meta title is required"),
		metaDescription: z.string().min(1, "Meta description is required"),
		h1: z.string().min(1, "H1 is required"),
		intro: z.string().min(1, "Intro is required"),
		body: z.string().min(1, "Body is required"),
		category: z.string().min(1, "Category is required"),
		author: z.string().min(1, "Author is required"),
		thumbnail: z.string().url("Thumbnail must be a valid URL").optional().or(z.literal("")),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	});
}

// Type for server-side BlogPost (used in server functions)
export type BlogPost = {
	_id?: string;
	metaTitle: string;
	metaDescription: string;
	h1: string;
	intro: string;
	body: string;
	category: string;
	author: string;
	thumbnail?: string;
	createdAt?: Date;
	updatedAt?: Date;
};
