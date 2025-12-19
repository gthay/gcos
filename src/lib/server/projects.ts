import { createServerFn } from "@tanstack/react-start";
import { getProjectsCollection } from "../db/collections";
import { projectCreateSchema } from "../schemas/project";
import { ObjectId } from "mongodb";

// Note: Auth is handled by AuthGuard component on the client side
// Server functions are only called from protected admin pages

export const getProjects = createServerFn({ method: "GET" }).handler(
	async () => {
		const collection = await getProjectsCollection();
		const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
		return projects.map((project) => ({
			...project,
			_id: project._id?.toString(),
		}));
	}
);

export const getProject = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid project ID");
		}
		const collection = await getProjectsCollection();
		const project = await collection.findOne({ _id: new ObjectId(id) });
		if (!project) {
			throw new Error("Project not found");
		}
		return {
			...project,
			_id: project._id?.toString(),
		};
	});

export const getProjectBySlug = createServerFn({ method: "GET" })
	.inputValidator((slug: string) => slug)
	.handler(async ({ data: slug }) => {
		const collection = await getProjectsCollection();
		const project = await collection.findOne({ slug });
		if (!project) {
			throw new Error("Project not found");
		}
		return {
			...project,
			_id: project._id?.toString(),
		};
	});

export const createProject = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => data)
	.handler(async ({ data }) => {
		const validated = projectCreateSchema.parse(data);
		const collection = await getProjectsCollection();

		// Check if slug already exists
		const existing = await collection.findOne({ slug: validated.slug });
		if (existing) {
			throw new Error("A project with this slug already exists");
		}

		const now = new Date();
		const result = await collection.insertOne({
			...validated,
			createdAt: now,
			updatedAt: now,
		});
		return result.insertedId.toString();
	});

export const updateProject = createServerFn({ method: "POST" })
	.inputValidator((input: { id: string; data: unknown }) => input)
	.handler(async ({ data: { id, data } }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid project ID");
		}
		const validated = projectCreateSchema.partial().parse(data);
		const collection = await getProjectsCollection();

		// If slug is being updated, check it doesn't conflict with another project
		if (validated.slug) {
			const existing = await collection.findOne({
				slug: validated.slug,
				_id: { $ne: new ObjectId(id) },
			});
			if (existing) {
				throw new Error("A project with this slug already exists");
			}
		}

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
			throw new Error("Project not found");
		}
		return result.modifiedCount > 0;
	});

export const deleteProject = createServerFn({ method: "POST" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid project ID");
		}
		const collection = await getProjectsCollection();
		const result = await collection.deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) {
			throw new Error("Project not found");
		}
		return true;
	});



