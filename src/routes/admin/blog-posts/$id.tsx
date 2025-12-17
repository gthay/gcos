import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getBlogPost, createBlogPost, updateBlogPost } from "@/lib/server/blog-posts";
import { blogPostCreateSchema } from "@/lib/schemas/blog-post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog-posts/$id")({
	component: BlogPostEditorPage,
});

function BlogPostEditorPage() {
	const { id } = useParams({ from: "/admin/blog-posts/$id" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = id === "new";

	const { data: post, isLoading } = useQuery({
		queryKey: ["blogPost", id],
		queryFn: () => getBlogPost({ data: id }),
		enabled: !isNew,
		refetchOnWindowFocus: false,
	});

	const createMutation = useMutation({
		mutationFn: (data: unknown) => createBlogPost({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
			toast.success("Blog post created");
			navigate({ to: "/admin/blog-posts" });
		},
		onError: (error) => {
			toast.error("Failed to create blog post", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: unknown }) => updateBlogPost({ data: { id, data } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
			queryClient.invalidateQueries({ queryKey: ["blogPost", id] });
			toast.success("Blog post updated");
		},
		onError: (error) => {
			toast.error("Failed to update blog post", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			metaTitle: "",
			metaDescription: "",
			h1: "",
			intro: "",
			body: "",
			category: "",
			author: "",
			thumbnail: "",
		},
		validators: {
			onSubmit: blogPostCreateSchema,
		},
		onSubmit: async ({ value }) => {
			if (isNew) {
				createMutation.mutate(value);
			} else {
				updateMutation.mutate({ id, data: value });
			}
		},
	});

	// Update form when post loads
	useEffect(() => {
		if (post && !isNew) {
			form.setFieldValue("metaTitle", post.metaTitle);
			form.setFieldValue("metaDescription", post.metaDescription);
			form.setFieldValue("h1", post.h1);
			form.setFieldValue("intro", post.intro);
			form.setFieldValue("body", post.body);
			form.setFieldValue("category", post.category);
			form.setFieldValue("author", post.author);
			form.setFieldValue("thumbnail", post.thumbnail || "");
		}
	}, [post, isNew, form]);

	if (!isNew && isLoading) {
		return (
			<DashboardLayout>
				<div>Loading...</div>
			</DashboardLayout>
		);
	}

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">{isNew ? "New Blog Post" : "Edit Blog Post"}</h1>
					<p className="text-muted-foreground">
						{isNew ? "Create a new blog post" : "Edit your blog post"}
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<div className="grid gap-6 md:grid-cols-2">
						<form.Field name="metaTitle">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Meta Title</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isSubmitting}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="category">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Category</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isSubmitting}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

					<form.Field name="metaDescription">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Meta Description</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
									aria-invalid={field.state.meta.errors.length > 0}
									rows={3}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="h1">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>H1 Title</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="intro">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Intro</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
									aria-invalid={field.state.meta.errors.length > 0}
									rows={4}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="body">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Body</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
									aria-invalid={field.state.meta.errors.length > 0}
									rows={12}
									className="font-mono text-sm"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<div className="grid gap-6 md:grid-cols-2">
						<form.Field name="author">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Author</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isSubmitting}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="thumbnail">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Thumbnail URL</Label>
									<Input
										id={field.name}
										type="url"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isSubmitting}
										aria-invalid={field.state.meta.errors.length > 0}
										placeholder="https://example.com/image.jpg"
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : isNew ? "Create Post" : "Update Post"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/blog-posts" })}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

