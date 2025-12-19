import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getProjects, deleteProject } from "@/lib/server/projects";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
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

export const Route = createFileRoute("/admin/projects/")({
	component: ProjectsPage,
});

function ProjectsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: projects = [], isLoading } = useQuery({
		queryKey: ["projects"],
		queryFn: () => getProjects(),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteProject({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			toast.success("Project deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete project", {
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
						<h1 className="text-3xl font-bold">Projects</h1>
						<p className="text-muted-foreground">Manage your open source projects</p>
					</div>
					<Button onClick={() => navigate({ to: "/admin/projects/new" })}>
						<Plus className="mr-2 h-4 w-4" />
						New Project
					</Button>
				</div>

				{projects.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">No projects yet.</p>
						<Button onClick={() => navigate({ to: "/admin/projects/new" })}>
							<Plus className="mr-2 h-4 w-4" />
							Create your first project
						</Button>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>Short Description</TableHead>
									<TableHead>Links</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{projects.map((project) => (
									<TableRow key={project._id}>
										<TableCell className="font-medium">{project.name}</TableCell>
										<TableCell className="font-mono text-sm text-muted-foreground">
											/{project.slug}
										</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{project.shortDescription}
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												{project.githubUrl && (
													<a
														href={project.githubUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-muted-foreground hover:text-foreground"
														title="GitHub"
													>
														<ExternalLink className="h-4 w-4" />
													</a>
												)}
											</div>
										</TableCell>
										<TableCell>
											{project.createdAt
												? new Date(project.createdAt).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => navigate({ to: `/admin/projects/${project._id}` })}
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
															<AlertDialogTitle>Delete Project</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{project.name}"? This action
																cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(project._id!)}
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



