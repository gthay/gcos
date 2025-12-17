import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getBlogPosts, deleteBlogPost } from "@/lib/server/blog-posts";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export const Route = createFileRoute("/admin/blog-posts")({
	component: BlogPostsPage,
});

function BlogPostsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: posts = [], isLoading } = useQuery({
		queryKey: ["blogPosts"],
		queryFn: () => getBlogPosts(),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteBlogPost({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
			toast.success("Blog post deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete blog post", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id);
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<div>Loading...</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Blog Posts</h1>
						<p className="text-muted-foreground">Manage your blog posts</p>
					</div>
					<Button onClick={() => navigate({ to: "/admin/blog-posts/new" })}>
						<Plus className="mr-2 h-4 w-4" />
						New Post
					</Button>
				</div>

				{posts.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">No blog posts yet.</p>
						<Button onClick={() => navigate({ to: "/admin/blog-posts/new" })}>
							<Plus className="mr-2 h-4 w-4" />
							Create your first post
						</Button>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Author</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{posts.map((post) => (
									<TableRow key={post._id}>
										<TableCell className="font-medium">{post.h1}</TableCell>
										<TableCell>{post.category}</TableCell>
										<TableCell>{post.author}</TableCell>
										<TableCell>
											{post.createdAt
												? new Date(post.createdAt).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => navigate({ to: `/admin/blog-posts/${post._id}` })}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="ghost" size="icon">
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{post.h1}"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(post._id!)}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
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

