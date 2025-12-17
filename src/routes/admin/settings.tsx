import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Settings</h1>
					<p className="text-muted-foreground">Manage your CMS settings</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>System Settings</CardTitle>
						<CardDescription>Configure your CMS system preferences</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">Settings configuration coming soon...</p>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
