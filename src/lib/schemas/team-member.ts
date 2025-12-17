import { z } from "zod";

// Supported projects
export const PROJECTS = [
	"sktime",
	"feature-engine",
	"pytorch-forecasting",
	"pgmpy",
] as const;

export type Project = (typeof PROJECTS)[number];

// Client-safe schema (no MongoDB dependencies)
// This is used for form validation on the client side
export const teamMemberCreateSchema = z.object({
	picture: z.string().url("Picture must be a valid URL").optional().or(z.literal("")),
	name: z.string().min(1, "Name is required"),
	positionDe: z.string().min(1, "Position (German) is required"),
	positionEn: z.string().min(1, "Position (English) is required"),
	project: z.enum(PROJECTS, {
		required_error: "Project is required",
		invalid_type_error: "Invalid project selected",
	}),
});

export type TeamMemberCreate = z.infer<typeof teamMemberCreateSchema>;

// Server-only schema with MongoDB ObjectId
// This is only imported on the server side
export async function getTeamMemberSchema() {
	// Dynamic import to avoid bundling MongoDB on client
	const { ObjectId } = await import("mongodb");
	return z.object({
		_id: z.instanceof(ObjectId).optional(),
		picture: z.string().url("Picture must be a valid URL").optional().or(z.literal("")),
		name: z.string().min(1, "Name is required"),
		positionDe: z.string().min(1, "Position (German) is required"),
		positionEn: z.string().min(1, "Position (English) is required"),
		project: z.enum(PROJECTS, {
			required_error: "Project is required",
			invalid_type_error: "Invalid project selected",
		}),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	});
}

// Type for server-side TeamMember (used in server functions)
export type TeamMember = {
	_id?: string;
	picture?: string;
	name: string;
	positionDe: string;
	positionEn: string;
	project: Project;
	createdAt?: Date;
	updatedAt?: Date;
};
