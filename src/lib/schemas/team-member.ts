import { z } from "zod";

// Client-safe schema (no MongoDB dependencies)
// This is used for form validation on the client side
export const teamMemberCreateSchema = z.object({
	// Basic info
	picture: z.string().min(1, "Profile picture is required"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().optional().or(z.literal("")),
	affiliation: z.string().optional().or(z.literal("")), // Company/Organization affiliation

	// Council
	isCouncil: z.boolean().optional(),
	councilTitle: z.string().optional().or(z.literal("")), // EN - Default: "Council Member"
	councilTitleDe: z.string().optional().or(z.literal("")), // DE - Default: "Beiratsmitglied"

	// Consultant
	isConsultant: z.boolean().optional(),
	consultantTitle: z.string().optional().or(z.literal("")), // EN - Default: "Consultant"
	consultantTitleDe: z.string().optional().or(z.literal("")), // DE - Default: "Berater"

	// Course Instructor
	isCourseInstructor: z.boolean().optional(),
	courseInstructorTitle: z.string().optional().or(z.literal("")), // EN - Default: "Course Instructor"
	courseInstructorTitleDe: z.string().optional().or(z.literal("")), // DE - Default: "Kursleiter"

	// Projects (multi-select, optional)
	projects: z.array(z.string()).optional(),

	// Project-specific titles (per project slug)
	projectTitles: z
		.record(
			z.string(), // project slug
			z.object({
				titleEn: z.string().optional(),
				titleDe: z.string().optional(),
			})
		)
		.optional(),

	// Social links
	githubUrl: z
		.string()
		.url("GitHub URL must be a valid URL")
		.optional()
		.or(z.literal("")),
	linkedinUrl: z
		.string()
		.url("LinkedIn URL must be a valid URL")
		.optional()
		.or(z.literal("")),
	websiteUrl: z
		.string()
		.url("Website URL must be a valid URL")
		.optional()
		.or(z.literal("")),
});

export type TeamMemberCreate = z.infer<typeof teamMemberCreateSchema>;

// Server-only schema with MongoDB ObjectId
// This is only imported on the server side
export async function getTeamMemberSchema() {
	// Dynamic import to avoid bundling MongoDB on client
	const { ObjectId } = await import("mongodb");
	return z.object({
		_id: z.instanceof(ObjectId).optional(),
		// Basic info
		picture: z.string().min(1, "Profile picture is required"),
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().optional().or(z.literal("")),
		affiliation: z.string().optional().or(z.literal("")),

		// Council
		isCouncil: z.boolean().optional(),
		councilTitle: z.string().optional().or(z.literal("")),
		councilTitleDe: z.string().optional().or(z.literal("")),

		// Consultant
		isConsultant: z.boolean().optional(),
		consultantTitle: z.string().optional().or(z.literal("")),
		consultantTitleDe: z.string().optional().or(z.literal("")),

		// Course Instructor
		isCourseInstructor: z.boolean().optional(),
		courseInstructorTitle: z.string().optional().or(z.literal("")),
		courseInstructorTitleDe: z.string().optional().or(z.literal("")),

		// Projects
		projects: z.array(z.string()).optional(),

		// Project-specific titles
		projectTitles: z
			.record(
				z.string(),
				z.object({
					titleEn: z.string().optional(),
					titleDe: z.string().optional(),
				})
			)
			.optional(),

		// Social links
		githubUrl: z.string().optional().or(z.literal("")),
		linkedinUrl: z.string().optional().or(z.literal("")),
		websiteUrl: z.string().optional().or(z.literal("")),

		// Timestamps
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	});
}

// Type for server-side TeamMember (used in server functions)
export type TeamMember = {
	_id?: string;
	// Basic info
	picture: string;
	firstName: string;
	lastName?: string;
	affiliation?: string;

	// Council
	isCouncil?: boolean;
	councilTitle?: string;
	councilTitleDe?: string;

	// Consultant
	isConsultant?: boolean;
	consultantTitle?: string;
	consultantTitleDe?: string;

	// Course Instructor
	isCourseInstructor?: boolean;
	courseInstructorTitle?: string;
	courseInstructorTitleDe?: string;

	// Projects
	projects?: string[];

	// Project-specific titles
	projectTitles?: Record<string, { titleEn?: string; titleDe?: string }>;

	// Social links
	githubUrl?: string;
	linkedinUrl?: string;
	websiteUrl?: string;

	// Timestamps
	createdAt?: Date;
	updatedAt?: Date;
};

// Helper to get display title for a role based on locale
export function getCouncilDisplayTitle(
	member: TeamMember,
	locale: string = "en"
): string {
	if (locale === "de") {
		return member.councilTitleDe || "Beiratsmitglied";
	}
	return member.councilTitle || "Council Member";
}

export function getConsultantDisplayTitle(
	member: TeamMember,
	locale: string = "en"
): string {
	if (locale === "de") {
		return member.consultantTitleDe || "Berater";
	}
	return member.consultantTitle || "Consultant";
}

export function getCourseInstructorDisplayTitle(
	member: TeamMember,
	locale: string = "en"
): string {
	if (locale === "de") {
		return member.courseInstructorTitleDe || "Kursleiter";
	}
	return member.courseInstructorTitle || "Course Instructor";
}

export function getProjectDisplayTitle(
	member: TeamMember,
	projectSlug: string,
	locale: string = "en"
): string {
	const titles = member.projectTitles?.[projectSlug];

	if (locale === "de") {
		return titles?.titleDe || titles?.titleEn || "Entwickler";
	}
	return titles?.titleEn || "Developer";
}

// Team Page Config schema for storing sort orders
export const teamPageConfigSchema = z.object({
	councilMemberOrder: z.array(z.string()).optional(),
	consultantOrder: z.array(z.string()).optional(),
	courseInstructorOrder: z.array(z.string()).optional(),
});

export type TeamPageConfig = z.infer<typeof teamPageConfigSchema>;
