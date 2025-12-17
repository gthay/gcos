import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { admin as adminPlugin } from "better-auth/plugins";
import { getDb } from "@/lib/db";
import { ac, admin, user } from "./permissions";

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
				// Disable public registration - admins create accounts via CMS
				disableSignUp: true,
			},
			// Rate limiting to prevent brute-force attacks
			rateLimit: {
				enabled: true,
				window: 60, // 60 seconds window
				max: 10, // Max 10 requests per window for general endpoints
				customRules: {
					// Stricter limits for login attempts
					"/sign-in/email": {
						window: 60, // 1 minute
						max: 5, // Only 5 login attempts per minute
					},
					"/sign-up/email": {
						window: 60,
						max: 3, // Only 3 sign-up attempts per minute
					},
					"/forget-password": {
						window: 300, // 5 minutes
						max: 3, // Only 3 password reset requests per 5 minutes
					},
					// Exclude admin endpoints from rate limiting - they're already protected by authentication
					"/admin/*": false, // All admin endpoints are excluded
				},
				storage: "database", // Persist rate limit data in database
			},
			plugins: [
				// Admin plugin for user management and roles
				adminPlugin({
					ac,
					roles: {
						admin,
						user,
					},
					// Default role for new users created by admins
					defaultRole: "user",
				}),
				// TanStack Start cookies must be last in plugins array
				tanstackStartCookies(),
			],
		});
	}
	return authInstance;
}

