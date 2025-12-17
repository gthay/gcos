import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
	beforeLoad: () => {
		// Redirect to dashboard - AuthGuard will handle login redirect if not authenticated
		throw redirect({
			to: "/admin/dashboard",
			replace: true,
		});
	},
});
