import { z } from "zod";
import { ObjectId } from "mongodb";

export const blogPostSchema = z.object({
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

export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogPostCreateSchema = blogPostSchema.omit({ _id: true, createdAt: true, updatedAt: true });

export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>;


