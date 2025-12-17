import { getDb } from "../db";
import type { BlogPost } from "../schemas/blog-post";
import type { TeamMember } from "../schemas/team-member";
import type { Course } from "../schemas/course";

export async function getBlogPostsCollection() {
	const db = await getDb();
	return db.collection<BlogPost>("blogPosts");
}

export async function getTeamMembersCollection() {
	const db = await getDb();
	return db.collection<TeamMember>("teamMembers");
}

export async function getCoursesCollection() {
	const db = await getDb();
	return db.collection<Course>("courses");
}


