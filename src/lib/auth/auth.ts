import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDb } from "@/lib/db";

// Initialize database connection and get Db instance
let dbInstance: Awaited<ReturnType<typeof getDb>> | null = null;

async function initDb() {
	if (!dbInstance) {
		dbInstance = await getDb();
	}
	return dbInstance;
}

// Lazy initialization of auth instance
let authInstance: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
	if (!authInstance) {
		// Lazy import env to avoid validation at module load time
		const { env } = await import("@/env");
		
		// Initialize database before creating auth instance
		const db = await initDb();
		
		// Create auth instance
		authInstance = betterAuth({
			database: mongodbAdapter(db),
			baseURL: env.BETTER_AUTH_URL,
			secret: env.BETTER_AUTH_SECRET,
			emailAndPassword: {
				enabled: true,
			},
			plugins: [tanstackStartCookies()], // Must be last in plugins array
		});
	}
	return authInstance;
}

