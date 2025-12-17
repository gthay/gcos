import { z } from "zod";

// Client-safe schema (no MongoDB dependencies)
// This is used for form validation on the client side
export const projectCreateSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug must be lowercase, alphanumeric, and use hyphens (e.g., 'my-project')"
		),
	name: z.string().min(1, "Project name is required"),
	// English content
	metaTitle: z.string().min(1, "Meta title is required"),
	metaDescription: z.string().min(1, "Meta description is required"),
	shortDescription: z.string().min(1, "Short description is required"),
	longDescription: z.string().min(1, "Long description is required"),
	// German content
	metaTitleDe: z.string().optional().or(z.literal("")),
	metaDescriptionDe: z.string().optional().or(z.literal("")),
	shortDescriptionDe: z.string().optional().or(z.literal("")),
	longDescriptionDe: z.string().optional().or(z.literal("")),
	// Other fields
	logo: z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
	githubUrl: z
		.string()
		.url("GitHub URL must be a valid URL")
		.optional()
		.or(z.literal("")),
	docsUrl: z
		.string()
		.url("Documentation URL must be a valid URL")
		.optional()
		.or(z.literal("")),
	websiteUrl: z
		.string()
		.url("Website URL must be a valid URL")
		.optional()
		.or(z.literal("")),
});

export type ProjectCreate = z.infer<typeof projectCreateSchema>;

// Type for server-side Project (used in server functions)
export type Project = {
	_id?: string;
	slug: string;
	name: string;
	// English content
	metaTitle: string;
	metaDescription: string;
	shortDescription: string;
	longDescription: string;
	// German content
	metaTitleDe?: string;
	metaDescriptionDe?: string;
	shortDescriptionDe?: string;
	longDescriptionDe?: string;
	// Other fields
	logo?: string;
	githubUrl?: string;
	docsUrl?: string;
	websiteUrl?: string;
	createdAt?: Date;
	updatedAt?: Date;
};
