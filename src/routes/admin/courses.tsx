import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getCourses, deleteCourse } from "@/lib/server/courses";
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

export const Route = createFileRoute("/admin/courses")({
	component: CoursesLayout,
});

function CoursesLayout() {
	const router = useRouterState();
	const currentPath = router.location.pathname;
	
	// If we're exactly on /admin/courses, show the list
	// Otherwise, render the child route via Outlet
	if (currentPath === "/admin/courses") {
		return <CoursesPage />;
	}
	
	return <Outlet />;
}

function CoursesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: courses = [], isLoading } = useQuery({
		queryKey: ["courses"],
		queryFn: () => getCourses(),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteCourse({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			toast.success("Course deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete course", {
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
						<h1 className="text-3xl font-bold">Courses</h1>
						<p className="text-muted-foreground">Manage your courses</p>
					</div>
					<Button onClick={() => navigate({ to: "/admin/courses/new" })}>
						<Plus className="mr-2 h-4 w-4" />
						New Course
					</Button>
				</div>

				{courses.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">No courses yet.</p>
						<Button onClick={() => navigate({ to: "/admin/courses/new" })}>
							<Plus className="mr-2 h-4 w-4" />
							Create your first course
						</Button>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Date & Time</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Hosts</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{courses.map((course) => (
									<TableRow key={course._id}>
										<TableCell className="font-medium">{course.h1}</TableCell>
										<TableCell>{course.dateTime}</TableCell>
										<TableCell>{course.location}</TableCell>
										<TableCell>{course.hosts?.length || 0} host(s)</TableCell>
										<TableCell>
											{course.createdAt
												? new Date(course.createdAt).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => navigate({ to: `/admin/courses/${course._id}` })}
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
															<AlertDialogTitle>Delete Course</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{course.h1}"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(course._id!)}
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

