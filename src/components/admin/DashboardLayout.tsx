import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
	LayoutDashboard,
	FileText,
	Users,
	Settings,
	LogOut,
	GraduationCap,
	FolderOpen,
} from "lucide-react";
import { AuthGuard } from "./AuthGuard";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			toast.success("Logged out successfully");
			window.location.href = "/admin/login";
		} catch (error) {
			toast.error("Failed to logout");
		}
	};

	const menuItems = [
		{
			icon: LayoutDashboard,
			label: "Dashboard",
			href: "/admin/dashboard",
		},
		{
			icon: GraduationCap,
			label: "Courses",
			href: "/admin/courses",
		},
		{
			icon: FileText,
			label: "Blog Posts",
			href: "/admin/blog-posts",
		},
		{
			icon: Users,
			label: "Team Members",
			href: "/admin/team-members",
		},
		{
			icon: FolderOpen,
			label: "Files",
			href: "/admin/files",
		},
		{
			icon: Settings,
			label: "Settings",
			href: "/admin/settings",
		},
	];

	return (
		<AuthGuard>
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<aside className="w-64 border-r border-border bg-card">
				<div className="flex h-full flex-col">
					{/* Header */}
					<div className="border-b border-border p-4">
						<h1 className="text-lg font-semibold">GC.OS CMS</h1>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 p-4">
						{menuItems.map((item) => {
							const Icon = item.icon;
							const isActive = currentPath === item.href;
							return (
								<Link
									key={item.href}
									to={item.href}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									}`}
								>
									<Icon className="h-5 w-5" />
									{item.label}
								</Link>
							);
						})}
					</nav>

					{/* Footer */}
					<div className="border-t border-border p-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Theme</span>
							<ThemeToggle />
						</div>
						<Button
							variant="outline"
							className="w-full"
							onClick={handleLogout}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</Button>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 overflow-auto">
				<div className="container mx-auto p-6">{children}</div>
			</main>
		</div>
		</AuthGuard>
	);
}


