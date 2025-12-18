import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getBlogPosts } from "@/lib/server/blog-posts";
import { getTeamMembers } from "@/lib/server/team-members";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Settings } from "lucide-react";

export const Route = createFileRoute("/admin/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { data: posts = [] } = useQuery({
		queryKey: ["blogPosts"],
		queryFn: () => getBlogPosts(),
	});

	const { data: members = [] } = useQuery({
		queryKey: ["teamMembers"],
		queryFn: () => getTeamMembers(),
	});

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">Welcome to the GC.OS CMS</p>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{posts.length}</div>
							<p className="text-xs text-muted-foreground">Total posts</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Team</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{members.length}</div>
							<p className="text-xs text-muted-foreground">Total members</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Settings</CardTitle>
							<Settings className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">—</div>
							<p className="text-xs text-muted-foreground">System configuration</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
