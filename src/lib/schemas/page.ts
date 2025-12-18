import { z } from "zod";

// Predefined page IDs
export const PREDEFINED_PAGES = [
	{
		id: "privacy-policy",
		labelEn: "Privacy Policy",
		labelDe: "Datenschutzerklärung",
	},
	{
		id: "imprint",
		labelEn: "Imprint",
		labelDe: "Impressum",
	},
] as const;

export type PredefinedPageId = (typeof PREDEFINED_PAGES)[number]["id"];

// Client-safe schema (no MongoDB dependencies)
export const pageCreateSchema = z.object({
	titleEn: z.string().min(1, "English title is required"),
	titleDe: z.string().min(1, "German title is required"),
	contentEn: z.string().min(1, "English content is required"),
	contentDe: z.string().min(1, "German content is required"),
});

export type PageCreate = z.infer<typeof pageCreateSchema>;

// Server-only schema with MongoDB ObjectId
export async function getPageSchema() {
	return z.object({
		_id: z.string(), // Using predefined string IDs like "privacy-policy"
		titleEn: z.string().min(1, "English title is required"),
		titleDe: z.string().min(1, "German title is required"),
		contentEn: z.string().min(1, "English content is required"),
		contentDe: z.string().min(1, "German content is required"),
		updatedAt: z.date().optional(),
	});
}

// Type for server-side Page
export type Page = {
	_id: string;
	titleEn: string;
	titleDe: string;
	contentEn: string;
	contentDe: string;
	updatedAt?: Date;
};


