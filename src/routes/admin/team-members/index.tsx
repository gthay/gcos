import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getTeamMembers, deleteTeamMember } from "@/lib/server/team-members";
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

export const Route = createFileRoute("/admin/team-members/")({
	component: TeamMembersPage,
});

function TeamMembersPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: members = [], isLoading } = useQuery({
		queryKey: ["teamMembers"],
		queryFn: () => getTeamMembers(),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteTeamMember({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
			toast.success("Team member deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete team member", {
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
						<h1 className="text-3xl font-bold">Team Members</h1>
						<p className="text-muted-foreground">Manage your team members</p>
					</div>
					<Button onClick={() => navigate({ to: "/admin/team-members/new" })}>
						<Plus className="mr-2 h-4 w-4" />
						New Member
					</Button>
				</div>

				{members.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">No team members yet.</p>
						<Button onClick={() => navigate({ to: "/admin/team-members/new" })}>
							<Plus className="mr-2 h-4 w-4" />
							Add your first member
						</Button>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Picture</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Position</TableHead>
									<TableHead>Project</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{members.map((member) => (
									<TableRow key={member._id}>
										<TableCell>
											{member.picture ? (
												<img
													src={member.picture}
													alt={member.name}
													className="h-10 w-10 rounded-full object-cover"
												/>
											) : (
												<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
													<span className="text-xs text-muted-foreground">No image</span>
												</div>
											)}
										</TableCell>
										<TableCell className="font-medium">{member.name}</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="text-sm">{member.positionEn || "—"}</div>
												{member.positionDe && (
													<div className="text-xs text-muted-foreground">
														{member.positionDe}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
												{member.project}
											</span>
										</TableCell>
										<TableCell>
											{member.createdAt
												? new Date(member.createdAt).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => navigate({ to: `/admin/team-members/${member._id}` })}
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
															<AlertDialogTitle>Delete Team Member</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{member.name}"? This action
																cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(member._id!)}
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
