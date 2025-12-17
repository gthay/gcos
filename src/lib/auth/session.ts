import { getAuth } from "./auth";
import type { Session } from "better-auth/types";

export async function getSession(request?: Request): Promise<Session | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: request?.headers,
	});
	return session;
}

export async function requireAuth(request?: Request): Promise<Session> {
	const session = await getSession(request);
	if (!session) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return session;
}

// For use in server$ functions - gets session from the current request context
export async function requireAuthInServer(): Promise<Session> {
	const auth = await getAuth();
	// In server$ functions, we can access the request through the context
	// Better-auth with reactStartCookies should handle cookies automatically
	const session = await auth.api.getSession();
	if (!session) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return session;
}

