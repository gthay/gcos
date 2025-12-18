import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
	LayoutDashboard,
	// FileText, // TODO: Re-enable when blog posts section is ready
	Users,
	// Settings, // TODO: Re-enable when settings page is ready
	LogOut,
	// GraduationCap, // TODO: Re-enable when courses section is ready
	ImageIcon,
	UserCog,
	Shield,
	FolderKanban,
	StickyNote,
} from "lucide-react";
import { AuthGuard } from "./AuthGuard";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouterState();
	const currentPath = router.location.pathname;
	const { data: session } = authClient.useSession();

	// Check if current user is admin
	const isAdmin = session?.user?.role === "admin";

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
			href: "/admin",
		},
		{
			icon: FolderKanban,
			label: "Projects",
			href: "/admin/projects",
		},
		// TODO: Re-enable when courses section is ready
		// {
		// 	icon: GraduationCap,
		// 	label: "Courses",
		// 	href: "/admin/courses",
		// },
		// TODO: Re-enable when blog posts section is ready
		// {
		// 	icon: FileText,
		// 	label: "Blog Posts",
		// 	href: "/admin/blog-posts",
		// },
		{
			icon: Users,
			label: "Team",
			href: "/admin/team-members",
		},
		{
			icon: ImageIcon,
			label: "Media",
			href: "/admin/media",
		},
		{
			icon: StickyNote,
			label: "Pages",
			href: "/admin/pages",
		},
		// Users menu - only visible to admins
		...(isAdmin
			? [
					{
						icon: UserCog,
						label: "Users",
						href: "/admin/users",
					},
				]
			: []),
		// TODO: Re-enable when settings page is ready
		// {
		// 	icon: Settings,
		// 	label: "Settings",
		// 	href: "/admin/settings",
		// },
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
					<div className="border-t border-border p-4 space-y-3">
						{/* User info */}
						{session?.user && (
							<div className="flex items-center gap-2 text-sm">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									{isAdmin ? (
										<Shield className="h-4 w-4 text-primary" />
									) : (
										<Users className="h-4 w-4 text-muted-foreground" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="truncate font-medium text-sm">
										{session.user.name || session.user.email}
									</p>
									<p className="text-xs text-muted-foreground">
										{isAdmin ? "Administrator" : "User"}
									</p>
								</div>
							</div>
						)}
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Theme</span>
							<ThemeToggle />
						</div>
						<Button variant="outline" className="w-full" onClick={handleLogout}>
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


