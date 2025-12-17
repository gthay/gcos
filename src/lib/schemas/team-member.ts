import { z } from "zod";
import { ObjectId } from "mongodb";

export const teamMemberSchema = z.object({
	_id: z.instanceof(ObjectId).optional(),
	picture: z.string().url("Picture must be a valid URL").optional().or(z.literal("")),
	name: z.string().min(1, "Name is required"),
	position: z.string().min(1, "Position is required"),
	project: z.string().min(1, "Project is required"),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

export const teamMemberCreateSchema = teamMemberSchema.omit({ _id: true, createdAt: true, updatedAt: true });

export type TeamMemberCreate = z.infer<typeof teamMemberCreateSchema>;


