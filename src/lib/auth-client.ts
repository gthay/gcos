import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user } from "./auth/permissions";

export const authClient = createAuthClient({
	baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
	plugins: [
		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
	],
});







