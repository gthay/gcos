import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getTeamMember, createTeamMember, updateTeamMember } from "@/lib/server/team-members";
import { teamMemberCreateSchema } from "@/lib/schemas/team-member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/team-members/$id")({
	component: TeamMemberEditorPage,
});

function TeamMemberEditorPage() {
	const { id } = useParams({ from: "/admin/team-members/$id" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = id === "new";

	const { data: member, isLoading } = useQuery({
		queryKey: ["teamMember", id],
		queryFn: () => getTeamMember({ data: id }),
		enabled: !isNew,
	});

	const createMutation = useMutation({
		mutationFn: (data: unknown) => createTeamMember({ data }),
		onSuccess: (newId) => {
			queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
			toast.success("Team member created");
			navigate({ to: `/admin/team-members/${newId}` });
		},
		onError: (error) => {
			toast.error("Failed to create team member", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: unknown }) => updateTeamMember({ data: { id, data } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
			queryClient.invalidateQueries({ queryKey: ["teamMember", id] });
			toast.success("Team member updated");
		},
		onError: (error) => {
			toast.error("Failed to update team member", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			picture: "",
			name: "",
			position: "",
			project: "",
		},
		validators: {
			onChange: teamMemberCreateSchema,
		},
		onSubmit: async ({ value }) => {
			if (isNew) {
				createMutation.mutate(value);
			} else {
				updateMutation.mutate({ id, data: value });
			}
		},
	});

	// Update form when member loads
	useEffect(() => {
		if (member && !isNew) {
			form.setFieldValue("picture", member.picture || "");
			form.setFieldValue("name", member.name);
			form.setFieldValue("position", member.position);
			form.setFieldValue("project", member.project);
		}
	}, [member, isNew, form]);

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
					<h1 className="text-3xl font-bold">{isNew ? "New Team Member" : "Edit Team Member"}</h1>
					<p className="text-muted-foreground">
						{isNew ? "Add a new team member" : "Edit team member information"}
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<form.Field name="picture">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Picture URL</Label>
								<Input
									id={field.name}
									type="url"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
									aria-invalid={field.state.meta.errors.length > 0}
									placeholder="https://example.com/picture.jpg"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								)}
								{field.state.value && (
									<div className="mt-2">
										<img
											src={field.state.value}
											alt="Preview"
											className="h-24 w-24 rounded-full object-cover border"
											onError={(e) => {
												e.currentTarget.style.display = "none";
											}}
										/>
									</div>
								)}
							</div>
						)}
					</form.Field>

					<div className="grid gap-6 md:grid-cols-2">
						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Name</Label>
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

						<form.Field name="position">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Position</Label>
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

					<form.Field name="project">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Project</Label>
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

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : isNew ? "Create Member" : "Update Member"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/team-members" })}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

