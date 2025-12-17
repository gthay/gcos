import { createServerFn } from "@tanstack/react-start";
import { getBlogPostsCollection } from "../db/collections";
import { blogPostCreateSchema } from "../schemas/blog-post";
import { ObjectId } from "mongodb";

// Note: Auth is handled by AuthGuard component on the client side
// Server functions are only called from protected admin pages

export const getBlogPosts = createServerFn({ method: "GET" }).handler(
	async () => {
		const collection = await getBlogPostsCollection();
		const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
		return posts.map((post) => ({
			...post,
			_id: post._id?.toString(),
		}));
	}
);

export const getBlogPost = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid blog post ID");
		}
		const collection = await getBlogPostsCollection();
		const post = await collection.findOne({ _id: new ObjectId(id) });
		if (!post) {
			throw new Error("Blog post not found");
		}
		return {
			...post,
			_id: post._id?.toString(),
		};
	});

export const createBlogPost = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => data)
	.handler(async ({ data }) => {
		const validated = blogPostCreateSchema.parse(data);
		const collection = await getBlogPostsCollection();
		const now = new Date();
		const result = await collection.insertOne({
			...validated,
			createdAt: now,
			updatedAt: now,
		});
		return result.insertedId.toString();
	});

export const updateBlogPost = createServerFn({ method: "POST" })
	.inputValidator((input: { id: string; data: unknown }) => input)
	.handler(async ({ data: { id, data } }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid blog post ID");
		}
		const validated = blogPostCreateSchema.partial().parse(data);
		const collection = await getBlogPostsCollection();
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
			throw new Error("Blog post not found");
		}
		return result.modifiedCount > 0;
	});

export const deleteBlogPost = createServerFn({ method: "POST" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		if (!ObjectId.isValid(id)) {
			throw new Error("Invalid blog post ID");
		}
		const collection = await getBlogPostsCollection();
		const result = await collection.deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) {
			throw new Error("Blog post not found");
		}
		return true;
	});
