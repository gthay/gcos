import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getTeamMember, createTeamMember, updateTeamMember } from "@/lib/server/team-members";
import { teamMemberCreateSchema, PROJECTS } from "@/lib/schemas/team-member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";

// Helper to extract error message from Zod validation errors
function getErrorMessage(error: unknown): string {
	if (typeof error === "string") return error;
	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}
	return "Invalid value";
}

function TeamMemberEditorPage() {
	const { id } = useParams({ from: "/admin/team-members/$id" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = id === "new";

	const { data: member, isLoading } = useQuery({
		queryKey: ["teamMember", id],
		queryFn: () => getTeamMember({ data: id }),
		enabled: !isNew,
		refetchOnWindowFocus: false,
	});

	const createMutation = useMutation({
		mutationFn: (data: unknown) => createTeamMember({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
			toast.success("Team member created");
			navigate({ to: "/admin/team-members" });
		},
		onError: (error) => {
			toast.error("Failed to create team member", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: unknown }) =>
			updateTeamMember({ data: { id, data } }),
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
			positionDe: "",
			positionEn: "",
			project: "" as (typeof PROJECTS)[number] | "",
		},
		validators: {
			onSubmit: teamMemberCreateSchema,
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
			form.setFieldValue("positionDe", member.positionDe || "");
			form.setFieldValue("positionEn", member.positionEn || "");
			form.setFieldValue("project", (member.project as (typeof PROJECTS)[number]) || "");
		}
	}, [member, isNew, form]);

	if (!isNew && isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</DashboardLayout>
		);
	}

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">
						{isNew ? "New Team Member" : "Edit Team Member"}
					</h1>
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
				{/* Image Selection */}
				<form.Field name="picture">
					{(field) => (
						<div className="space-y-2">
							<Label>Profile Picture</Label>
							<div className="flex gap-4 items-start">
								{/* Image Preview */}
								<div className="flex-shrink-0">
									{field.state.value ? (
										<div className="relative">
											<img
												src={field.state.value}
												alt="Profile preview"
												className="h-32 w-32 rounded-full object-cover border-2 border-border"
												onError={(e) => {
													e.currentTarget.src = "/images/Profile-Picture-Placeholder.webp";
												}}
											/>
											<button
												type="button"
												onClick={() => field.handleChange("")}
												className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
												disabled={isSubmitting}
												title="Remove image"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									) : (
										<div className="h-32 w-32 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
											<ImageIcon className="h-8 w-8 text-muted-foreground" />
										</div>
									)}
								</div>

								{/* Media Picker */}
								<div className="flex-1 space-y-3">
									<MediaPicker
										value={field.state.value}
										onSelect={(url) => field.handleChange(url)}
										disabled={isSubmitting}
									/>
									<p className="text-sm text-muted-foreground">
										Select an image from your media library. You can upload new images in the{" "}
										<a
											href="/admin/media"
											target="_blank"
											className="text-primary hover:underline"
										>
											Media Library
										</a>
										.
									</p>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{getErrorMessage(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						</div>
					</div>
				)}
			</form.Field>

				{/* Name */}
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
								placeholder="John Doe"
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">{getErrorMessage(field.state.meta.errors[0])}</p>
							)}
						</div>
					)}
				</form.Field>

					{/* Position - German and English */}
					<div className="grid gap-6 md:grid-cols-2">
						<form.Field name="positionDe">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										Position <span className="text-muted-foreground">(German)</span>
									</Label>
					<Input
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isSubmitting}
							aria-invalid={field.state.meta.errors.length > 0}
							placeholder="z.B. Projektleiter"
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-sm text-destructive">{getErrorMessage(field.state.meta.errors[0])}</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field name="positionEn">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>
							Position <span className="text-muted-foreground">(English)</span>
						</Label>
						<Input
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isSubmitting}
							aria-invalid={field.state.meta.errors.length > 0}
							placeholder="e.g. Project Lead"
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-sm text-destructive">{getErrorMessage(field.state.meta.errors[0])}</p>
						)}
					</div>
				)}
			</form.Field>
		</div>

		{/* Project Selection */}
		<form.Field name="project">
			{(field) => (
				<div className="space-y-2">
					<Label htmlFor={field.name}>Project</Label>
					<Select
						value={field.state.value}
						onValueChange={(value) => {
							field.handleChange(value as (typeof PROJECTS)[number]);
						}}
						disabled={isSubmitting}
					>
						<SelectTrigger
							id={field.name}
							aria-invalid={field.state.meta.errors.length > 0}
						>
							<SelectValue placeholder="Select a project" />
						</SelectTrigger>
						<SelectContent>
							{PROJECTS.map((project) => (
								<SelectItem key={project} value={project}>
									{project}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{field.state.meta.errors.length > 0 && (
						<p className="text-sm text-destructive">{getErrorMessage(field.state.meta.errors[0])}</p>
					)}
				</div>
			)}
		</form.Field>

					{/* Actions */}
					<div className="flex gap-4 pt-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : isNew ? (
								"Create Member"
							) : (
								"Update Member"
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/team-members" })}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

export const Route = createFileRoute("/admin/team-members/$id")({
	component: TeamMemberEditorPage,
});
