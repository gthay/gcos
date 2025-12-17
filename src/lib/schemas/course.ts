import { z } from "zod";

export const courseHostSchema = z.object({
	image: z.string().url("Host image must be a valid URL").optional().or(z.literal("")),
	title: z.string().min(1, "Host title is required"),
	description: z.string().optional().or(z.literal("")),
});

export type CourseHost = z.infer<typeof courseHostSchema>;

// Learning topic with title and bullet points
export const learningTopicSchema = z.object({
	title: z.string().min(1, "Topic title is required"),
	items: z.array(z.string()).min(1, "At least one item is required"),
});

export type LearningTopic = z.infer<typeof learningTopicSchema>;

// Client-safe schema (no MongoDB ObjectId)
export const courseCreateSchema = z.object({
	h1: z.string().min(1, "H1 is required"),
	metaTitle: z.string().min(1, "Meta title is required"),
	metaDescription: z.string().min(1, "Meta description is required"),
	shortDescription: z.string().min(1, "Short description is required"),
	longDescription: z.string().min(1, "Long description is required"),
	featuredImage: z.string().url("Featured image must be a valid URL").optional().or(z.literal("")),
	hosts: z.array(courseHostSchema).min(1, "At least one host is required"),
	dateTime: z.string().min(1, "Date and time is required"),
	location: z.string().min(1, "Location is required"),
	learningTopics: z.array(learningTopicSchema).optional(),
});

export type CourseCreate = z.infer<typeof courseCreateSchema>;

// Full schema with MongoDB fields (for server-side use only)
// Import ObjectId dynamically on server to avoid client bundling issues
export interface Course extends CourseCreate {
	_id?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

