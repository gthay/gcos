import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
	component: LoginPage,
});

function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				const result = await authClient.signIn.email({
					email: value.email,
					password: value.password,
				});

				if (result.error) {
					toast.error("Login failed", {
						description: result.error.message || "Invalid credentials",
					});
					return;
				}

				toast.success("Login successful");
				window.location.href = "/admin/dashboard";
			} catch (error) {
				toast.error("Login failed", {
					description: error instanceof Error ? error.message : "An error occurred",
				});
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-center space-y-4 pb-2">
					{/* Logo with shadow */}
					<div className="mb-2">
						<img
							src="/icons/GCOS-Brandmark.svg"
							alt="GC.OS"
							width={72}
							height={72}
							className="h-18 w-18 drop-shadow-lg"
						/>
					</div>
					<CardTitle className="text-2xl">GC.OS Login</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field
							name="email"
							validators={{
								onChange: ({ value }) => {
									if (!value) return "Email is required";
									if (!value.includes("@")) return "Invalid email address";
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isLoading}
										aria-invalid={field.state.meta.errors.length > 0}
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
								onChange: ({ value }) => {
									if (!value) return "Password is required";
									if (value.length < 6) return "Password must be at least 6 characters";
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isLoading}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

