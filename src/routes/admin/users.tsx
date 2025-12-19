import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Trash2,
	Shield,
	User,
	AlertCircle,
	Loader2,
	MoreVertical,
	KeyRound,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";

export const Route = createFileRoute("/admin/users")({
	component: UsersPage,
});

interface UserData {
	id: string;
	email: string;
	name: string;
	role?: string;
	createdAt: Date;
	emailVerified: boolean;
}

function UsersPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
	const { data: session } = authClient.useSession();

	// Check if current user is admin
	const isAdmin = session?.user?.role === "admin";

	// Fetch all users using Better Auth admin API
	const {
		data: users = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["admin", "users"],
		queryFn: async () => {
			const response = await authClient.admin.listUsers({
				query: {
					limit: 100,
				},
			});
			if (response.error) {
				throw new Error(response.error.message || "Failed to fetch users");
			}
			return (response.data?.users || []) as UserData[];
		},
		enabled: isAdmin,
		// Prevent excessive refetching that could trigger rate limits
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		refetchOnReconnect: true,
		staleTime: 30000, // Consider data fresh for 30 seconds
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: async (userId: string) => {
			const response = await authClient.admin.removeUser({
				userId,
			});
			if (response.error) {
				throw new Error(response.error.message || "Failed to delete user");
			}
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
			toast.success("User deleted successfully");
		},
		onError: (error) => {
			toast.error("Failed to delete user", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	// Update user role mutation
	const updateRoleMutation = useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
			const response = await authClient.admin.setRole({
				userId,
				role,
			});
			if (response.error) {
				throw new Error(response.error.message || "Failed to update role");
			}
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
			toast.success("User role updated");
		},
		onError: (error) => {
			toast.error("Failed to update role", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const handleDelete = (userId: string) => {
		deleteMutation.mutate(userId);
	};

	const handleToggleAdmin = (userId: string, currentRole: string | undefined) => {
		const newRole = currentRole === "admin" ? "user" : "admin";
		updateRoleMutation.mutate({ userId, role: newRole });
	};

	// Show access denied if not admin
	if (!isAdmin) {
		return (
			<DashboardLayout>
				<div className="space-y-6">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							You don't have permission to access this page. Only administrators can manage
							users.
						</AlertDescription>
					</Alert>
				</div>
			</DashboardLayout>
		);
	}

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Failed to load users: {error instanceof Error ? error.message : "Unknown error"}
					</AlertDescription>
				</Alert>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Users</h1>
						<p className="text-muted-foreground">Manage CMS user accounts</p>
					</div>
					<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New User
							</Button>
						</DialogTrigger>
						<CreateUserDialog
							onSuccess={() => {
								setIsCreateDialogOpen(false);
								queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
							}}
						/>
					</Dialog>
				</div>

				{/* Reset Password Dialog */}
				{resetPasswordUserId && (
					<ResetPasswordDialog
						userId={resetPasswordUserId}
						userEmail={
							users.find((u) => u.id === resetPasswordUserId)?.email || "this user"
						}
						onSuccess={() => setResetPasswordUserId(null)}
						onCancel={() => setResetPasswordUserId(null)}
					/>
				)}

				{users.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">No users yet.</p>
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Create your first user
						</Button>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.email}</TableCell>
										<TableCell>{user.name || "—"}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{user.role === "admin" ? (
													<>
														<Shield className="h-4 w-4 text-primary" />
														<span className="text-primary font-medium">Admin</span>
													</>
												) : (
													<>
														<User className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">User</span>
													</>
												)}
											</div>
										</TableCell>
										<TableCell>
											{user.createdAt
												? new Date(user.createdAt).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											{user.id !== session?.user?.id ? (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => handleToggleAdmin(user.id, user.role)}
															disabled={updateRoleMutation.isPending}
														>
															<Shield className="mr-2 h-4 w-4" />
															<span className="flex-1">Admin privileges</span>
															{user.role === "admin" && (
																<Check className="ml-2 h-4 w-4" />
															)}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => setResetPasswordUserId(user.id)}
														>
															<KeyRound className="mr-2 h-4 w-4" />
															Reset password
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<DropdownMenuItem
																	variant="destructive"
																	onSelect={(e) => e.preventDefault()}
																>
																	<Trash2 className="mr-2 h-4 w-4" />
																	Delete user
																</DropdownMenuItem>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Delete User</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete "{user.email}"? This action
																		cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() => handleDelete(user.id)}
																		className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																	>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</DropdownMenuContent>
												</DropdownMenu>
											) : (
												<span className="text-xs text-muted-foreground">(You)</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}

function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
			isAdmin: false,
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await authClient.admin.createUser({
					email: value.email,
					password: value.password,
					name: value.name,
					role: value.isAdmin ? "admin" : "user",
				});

				if (response.error) {
					setError(response.error.message || "Failed to create user");
					return;
				}

				toast.success("User created successfully", {
					description: `${value.email} has been added as ${value.isAdmin ? "an admin" : "a user"}.`,
				});
				onSuccess();
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<DialogContent className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Create New User</DialogTitle>
				<DialogDescription>
					Add a new user to the CMS. They will be able to log in immediately.
				</DialogDescription>
			</DialogHeader>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field
					name="name"
					validators={{
						onBlur: ({ value }) => {
							if (!value) return "Name is required";
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Name</Label>
							<Input
								id={field.name}
								placeholder="John Doe"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isLoading}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field
					name="email"
					validators={{
						onBlur: ({ value }) => {
							if (!value) return "Email is required";
							if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
								return "Please enter a valid email address";
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								type="email"
								placeholder="user@example.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isLoading}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field
					name="password"
					validators={{
						onBlur: ({ value }) => {
							if (!value) return "Password is required";
							if (value.length < 8) return "Password must be at least 8 characters";
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Password</Label>
							<Input
								id={field.name}
								type="password"
								placeholder="Minimum 8 characters"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isLoading}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="isAdmin">
					{(field) => (
						<div className="flex items-center space-x-2">
							<Checkbox
								id={field.name}
								checked={field.state.value}
								onCheckedChange={(checked) => field.handleChange(checked === true)}
								disabled={isLoading}
							/>
							<Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
								Grant admin privileges (can manage users)
							</Label>
						</div>
					)}
				</form.Field>

				<DialogFooter>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create User"
						)}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}

function ResetPasswordDialog({
	userId,
	userEmail,
	onSuccess,
	onCancel,
}: {
	userId: string;
	userEmail: string;
	onSuccess: () => void;
	onCancel: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			if (value.password !== value.confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await authClient.admin.setUserPassword({
					userId,
					newPassword: value.password,
				});

				if (response.error) {
					setError(response.error.message || "Failed to reset password");
					return;
				}

				toast.success("Password reset successfully", {
					description: `The password for ${userEmail} has been updated.`,
				});
				queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
				onSuccess();
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Set a new password for {userEmail}. They will need to use this password to log in.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="password"
						validators={{
							onBlur: ({ value }) => {
								if (!value) return "Password is required";
								if (value.length < 8) return "Password must be at least 8 characters";
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>New Password</Label>
								<Input
									id={field.name}
									type="password"
									placeholder="Minimum 8 characters"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => {
										field.handleChange(e.target.value);
										if (error) setError(null);
									}}
									disabled={isLoading}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="confirmPassword"
						validators={{
							onBlur: ({ value }) => {
								if (!value) return "Please confirm the password";
								const passwordValue = form.getFieldValue("password");
								if (value !== passwordValue) {
									return "Passwords do not match";
								}
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Confirm Password</Label>
								<Input
									id={field.name}
									type="password"
									placeholder="Re-enter the password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => {
										field.handleChange(e.target.value);
										if (error) setError(null);
									}}
									disabled={isLoading}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting...
								</>
							) : (
								"Reset Password"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}



