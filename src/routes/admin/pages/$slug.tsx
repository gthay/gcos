import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getPage, updatePage } from "@/lib/server/pages";
import { PREDEFINED_PAGES } from "@/lib/schemas/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages/$slug")({
	component: PageEditorPage,
});

function PageEditorPage() {
	const { slug } = useParams({ from: "/admin/pages/$slug" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Get predefined page info
	const predefinedPage = PREDEFINED_PAGES.find((p) => p.id === slug);

	const { data: page, isLoading } = useQuery({
		queryKey: ["page", slug],
		queryFn: () => getPage({ data: slug }),
		refetchOnWindowFocus: false,
	});

	const updateMutation = useMutation({
		mutationFn: (data: {
			titleEn: string;
			titleDe: string;
			contentEn: string;
			contentDe: string;
		}) => updatePage({ data: { id: slug as "privacy-policy" | "imprint", data } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pages"] });
			queryClient.invalidateQueries({ queryKey: ["page", slug] });
			toast.success("Page updated successfully");
			navigate({ to: "/admin/pages" });
		},
		onError: (error) => {
			toast.error("Failed to update page", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			titleEn: "",
			titleDe: "",
			contentEn: "",
			contentDe: "",
		},
		onSubmit: async ({ value }) => {
			updateMutation.mutate(value);
		},
	});

	// Track if form has been initialized to prevent overwriting user changes
	const hasInitializedRef = useRef(false);

	// Update form when page loads - ONLY ONCE
	useEffect(() => {
		if (page && !hasInitializedRef.current) {
			hasInitializedRef.current = true;
			form.setFieldValue("titleEn", page.titleEn || "");
			form.setFieldValue("titleDe", page.titleDe || "");
			form.setFieldValue("contentEn", page.contentEn || "");
			form.setFieldValue("contentDe", page.contentDe || "");
		}
	}, [page, form]);

	if (!predefinedPage) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
					<p className="text-muted-foreground mb-6">
						This page does not exist in the predefined pages list.
					</p>
					<Button onClick={() => navigate({ to: "/admin/pages" })}>
						Back to Pages
					</Button>
				</div>
			</DashboardLayout>
		);
	}

	if (isLoading) {
		return (
			<DashboardLayout>
				<div>Loading...</div>
			</DashboardLayout>
		);
	}

	const isSubmitting = updateMutation.isPending;

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Edit Page</h1>
					<p className="text-muted-foreground">
						{predefinedPage.labelEn} / {predefinedPage.labelDe}
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-8"
				>
					{/* Two-column layout for EN/DE */}
					<div className="grid gap-8 lg:grid-cols-2">
						{/* English Column */}
						<div className="space-y-6 rounded-lg border p-6">
							<h2 className="text-xl font-semibold flex items-center gap-2">
								<span className="text-xs font-medium px-2 py-1 bg-muted rounded">EN</span>
								English
							</h2>

							<form.Field name="titleEn">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Title</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="Privacy Policy"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="contentEn">
								{(field) => (
									<div className="space-y-2">
										<Label>Content</Label>
										<RichTextEditor
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											disabled={isSubmitting}
											placeholder="Enter the English content..."
										/>
									</div>
								)}
							</form.Field>
						</div>

						{/* German Column */}
						<div className="space-y-6 rounded-lg border p-6">
							<h2 className="text-xl font-semibold flex items-center gap-2">
								<span className="text-xs font-medium px-2 py-1 bg-muted rounded">DE</span>
								Deutsch
							</h2>

							<form.Field name="titleDe">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Titel</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="Datenschutzerklärung"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="contentDe">
								{(field) => (
									<div className="space-y-2">
										<Label>Inhalt</Label>
										<RichTextEditor
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											disabled={isSubmitting}
											placeholder="Geben Sie den deutschen Inhalt ein..."
										/>
									</div>
								)}
							</form.Field>
						</div>
					</div>

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save Page"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/pages" })}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

