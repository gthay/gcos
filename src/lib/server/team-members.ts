import { createServerFn } from "@tanstack/react-start";
import {
	getTeamMembersCollection,
	getTeamPageConfigCollection,
} from "../db/collections";
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

// Get team members by project slug (searches in projects array)
export const getTeamMembersByProject = createServerFn({ method: "GET" })
	.inputValidator((projectSlug: string) => projectSlug)
	.handler(async ({ data: projectSlug }) => {
		const collection = await getTeamMembersCollection();
		const members = await collection
			.find({ projects: projectSlug })
			.sort({ createdAt: -1 })
			.toArray();
		return members.map((member) => ({
			...member,
			_id: member._id?.toString(),
		}));
	});

// Get team page config (sort orders)
export const getTeamPageConfig = createServerFn({ method: "GET" }).handler(
	async () => {
		const collection = await getTeamPageConfigCollection();
		const config = await collection.findOne({ _id: "team-page-config" });
		return (
			config || {
				_id: "team-page-config",
				councilMemberOrder: [],
				consultantOrder: [],
				courseInstructorOrder: [],
			}
		);
	}
);

// Update team page config (sort orders)
export const updateTeamPageConfig = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			councilMemberOrder?: string[];
			consultantOrder?: string[];
			courseInstructorOrder?: string[];
		}) => data
	)
	.handler(async ({ data }) => {
		const collection = await getTeamPageConfigCollection();
		const result = await collection.updateOne(
			{ _id: "team-page-config" },
			{
				$set: {
					...data,
				},
			},
			{ upsert: true }
		);
		return result.acknowledged;
	});

// Get all team members for the public team page with sorting applied
export const getTeamPageData = createServerFn({ method: "GET" }).handler(
	async () => {
		const [membersCollection, configCollection] = await Promise.all([
			getTeamMembersCollection(),
			getTeamPageConfigCollection(),
		]);

		const [allMembers, config] = await Promise.all([
			membersCollection.find({}).toArray(),
			configCollection.findOne({ _id: "team-page-config" }),
		]);

		const members = allMembers.map((m) => ({
			...m,
			_id: m._id?.toString(),
		}));

		const sortOrder = config || {
			councilMemberOrder: [],
			consultantOrder: [],
			courseInstructorOrder: [],
		};

		// Helper to sort members by order array
		const sortByOrder = (
			memberList: typeof members,
			orderArray: string[]
		) => {
			const orderMap = new Map(orderArray.map((id, index) => [id, index]));
			return [...memberList].sort((a, b) => {
				const aIndex = orderMap.get(a._id!) ?? Number.MAX_SAFE_INTEGER;
				const bIndex = orderMap.get(b._id!) ?? Number.MAX_SAFE_INTEGER;
				return aIndex - bIndex;
			});
		};

		// Filter and sort council members
		const councilMembers = sortByOrder(
			members.filter((m) => m.isCouncil),
			sortOrder.councilMemberOrder || []
		);

		// Filter and sort consultants
		const consultants = sortByOrder(
			members.filter((m) => m.isConsultant),
			sortOrder.consultantOrder || []
		);

		// Filter and sort course instructors
		const courseInstructors = sortByOrder(
			members.filter((m) => m.isCourseInstructor),
			sortOrder.courseInstructorOrder || []
		);

		// Get unique projects from all members
		const uniqueProjects = [
			...new Set(members.flatMap((m) => m.projects || [])),
		];

		return {
			councilMembers,
			consultants,
			courseInstructors,
			uniqueProjects,
			allMembers: members,
		};
	}
);
