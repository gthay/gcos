import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
	component: LoginPage,
});

/**
 * Sanitizes error messages for security - prevents information leakage
 * about whether an email exists in the system or not.
 */
function getSecureErrorMessage(error: { message?: string; code?: string } | null): {
	message: string;
	isRateLimited: boolean;
} {
	if (!error) {
		return { message: "An unexpected error occurred. Please try again.", isRateLimited: false };
	}

	const errorCode = error.code?.toLowerCase() || "";
	const errorMessage = error.message?.toLowerCase() || "";

	// Detect rate limiting
	if (
		errorCode.includes("rate") ||
		errorCode.includes("limit") ||
		errorCode.includes("too_many") ||
		errorMessage.includes("rate") ||
		errorMessage.includes("too many") ||
		errorMessage.includes("limit")
	) {
		return {
			message: "Too many login attempts. Please wait a minute before trying again.",
			isRateLimited: true,
		};
	}

	// Generic message for all auth errors - don't reveal if email exists
	// This prevents user enumeration attacks
	return {
		message: "Invalid email or password. Please check your credentials and try again.",
		isRateLimited: false,
	};
}

function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [serverError, setServerError] = useState<{
		message: string;
		isRateLimited: boolean;
	} | null>(null);
	const emailInputRef = useRef<HTMLInputElement>(null);

	// Auto-focus email input on mount
	useEffect(() => {
		emailInputRef.current?.focus();
	}, []);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			setServerError(null);

			try {
				const result = await authClient.signIn.email({
					email: value.email,
					password: value.password,
				});

				if (result.error) {
					const secureError = getSecureErrorMessage(result.error);
					setServerError(secureError);
					return;
				}

				toast.success("Login successful", {
					description: "Redirecting to dashboard...",
				});
				window.location.href = "/admin";
			} catch (error) {
				const secureError = getSecureErrorMessage(
					error instanceof Error ? { message: error.message } : null
				);
				setServerError(secureError);
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
							alt="GC.OS Logo"
							width={72}
							height={72}
							className="h-18 w-18 drop-shadow-lg"
						/>
					</div>
					<div className="text-center">
						<CardTitle className="text-2xl">Admin Login</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Sign in to access the GC.OS dashboard
						</p>
					</div>
				</CardHeader>
				<CardContent>
					{/* Server error alert - visible inline for better UX */}
					{serverError && (
						<Alert
							variant="destructive"
							className="mb-4"
							role="alert"
							aria-live="assertive"
						>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{serverError.message}</AlertDescription>
						</Alert>
					)}

					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
						noValidate
					>
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
										ref={emailInputRef}
										id={field.name}
										type="email"
										placeholder="you@example.com"
										autoComplete="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => {
											field.handleChange(e.target.value);
											// Clear server error when user starts typing
											if (serverError) setServerError(null);
										}}
										disabled={isLoading}
										aria-invalid={field.state.meta.errors.length > 0}
										aria-describedby={
											field.state.meta.errors.length > 0
												? `${field.name}-error`
												: undefined
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p
											id={`${field.name}-error`}
											className="text-sm text-destructive"
											role="alert"
										>
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field
							name="password"
							validators={{
								onBlur: ({ value }) => {
									if (!value) return "Password is required";
									if (value.length < 6)
										return "Password must be at least 6 characters";
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Password</Label>
									<div className="relative">
										<Input
											id={field.name}
											type={showPassword ? "text" : "password"}
											placeholder="Enter your password"
											autoComplete="current-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => {
												field.handleChange(e.target.value);
												// Clear server error when user starts typing
												if (serverError) setServerError(null);
											}}
											disabled={isLoading}
											className="pr-10"
											aria-invalid={field.state.meta.errors.length > 0}
											aria-describedby={
												field.state.meta.errors.length > 0
													? `${field.name}-error`
													: undefined
											}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
											aria-label={showPassword ? "Hide password" : "Show password"}
											tabIndex={-1}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
									{field.state.meta.errors.length > 0 && (
										<p
											id={`${field.name}-error`}
											className="text-sm text-destructive"
											role="alert"
										>
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || serverError?.isRateLimited}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>

					{/* Back to website link */}
					<div className="mt-6 text-center">
						<Link
							to="/"
							className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="mr-1 h-3 w-3" />
							Back to website
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

