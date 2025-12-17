import { getDb } from "../db";
import type { BlogPost } from "../schemas/blog-post";
import type { TeamMember } from "../schemas/team-member";
import type { Course } from "../schemas/course";
import type { MediaMetadata } from "../schemas/media";
import type { Project } from "../schemas/project";
import type { Page } from "../schemas/page";

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

export async function getMediaCollection() {
	const db = await getDb();
	return db.collection<MediaMetadata>("media");
}

export async function getProjectsCollection() {
	const db = await getDb();
	return db.collection<Project>("projects");
}

export async function getPagesCollection() {
	const db = await getDb();
	return db.collection<Page>("pages");
}


