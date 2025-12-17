import { createServerFn } from "@tanstack/react-start";
import { getTeamMembersCollection } from "../db/collections";
import { teamMemberCreateSchema } from "../schemas/team-member";
import { ObjectId } from "mongodb";

// Note: Auth is handled by AuthGuard component on the client side
// Server functions are only called from protected admin pages

export const getTeamMembers = createServerFn({ method: "GET" }).handler(
	async () => {
		const collection = await getTeamMembersCollection();
		const members = await collection.find({}).sort({ createdAt: -1 }).toArray();
		return members.map((member) => ({
			...member,
			_id: member._id?.toString(),
		}));
	}
);

export const getTeamMember = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid team member ID");
		}
		const collection = await getTeamMembersCollection();
		const member = await collection.findOne({ _id: new ObjectId(id) });
		if (!member) {
			throw new Error("Team member not found");
		}
		return {
			...member,
			_id: member._id?.toString(),
		};
	});

export const createTeamMember = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => data)
	.handler(async ({ data }) => {
		const validated = teamMemberCreateSchema.parse(data);
		const collection = await getTeamMembersCollection();
		const now = new Date();
		const result = await collection.insertOne({
			...validated,
			createdAt: now,
			updatedAt: now,
		});
		return result.insertedId.toString();
	});

export const updateTeamMember = createServerFn({ method: "POST" })
	.inputValidator((input: { id: string; data: unknown }) => input)
	.handler(async ({ data: { id, data } }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid team member ID");
		}
		const validated = teamMemberCreateSchema.partial().parse(data);
		const collection = await getTeamMembersCollection();
		const result = await collection.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					...validated,
					updatedAt: new Date(),
				},
			}
		);
		if (result.matchedCount === 0) {
			throw new Error("Team member not found");
		}
		return result.modifiedCount > 0;
	});

export const deleteTeamMember = createServerFn({ method: "POST" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid team member ID");
		}
		const collection = await getTeamMembersCollection();
		const result = await collection.deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) {
			throw new Error("Team member not found");
		}
		return true;
	});
