import { createServerFn } from "@tanstack/react-start";
import { getCoursesCollection } from "../db/collections";
import { courseCreateSchema } from "../schemas/course";
import { ObjectId } from "mongodb";

// Note: Auth is handled by AuthGuard component on the client side
// Server functions are only called from protected admin pages

export const getCourses = createServerFn({ method: "GET" }).handler(
	async () => {
		const collection = await getCoursesCollection();
		const courses = await collection.find({}).sort({ createdAt: -1 }).toArray();
		return courses.map((course) => ({
			...course,
			_id: course._id?.toString(),
		}));
	}
);

export const getCourse = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid course ID");
		}
		const collection = await getCoursesCollection();
		const course = await collection.findOne({ _id: new ObjectId(id) });
		if (!course) {
			throw new Error("Course not found");
		}
		return {
			...course,
			_id: course._id?.toString(),
		};
	});

export const createCourse = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => data)
	.handler(async ({ data }) => {
		const validated = courseCreateSchema.parse(data);
		const collection = await getCoursesCollection();
		const now = new Date();
		const result = await collection.insertOne({
			...validated,
			createdAt: now,
			updatedAt: now,
		});
		return result.insertedId.toString();
	});

export const updateCourse = createServerFn({ method: "POST" })
	.inputValidator((input: { id: string; data: unknown }) => input)
	.handler(async ({ data: { id, data } }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid course ID");
		}
		const validated = courseCreateSchema.partial().parse(data);
		const collection = await getCoursesCollection();
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
			throw new Error("Course not found");
		}
		return result.modifiedCount > 0;
	});

export const deleteCourse = createServerFn({ method: "POST" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid course ID");
		}
		const collection = await getCoursesCollection();
		const result = await collection.deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) {
			throw new Error("Course not found");
		}
		return true;
	});





