import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getProject, createProject, updateProject } from "@/lib/server/projects";
import { getTeamMembersByProject } from "@/lib/server/team-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	MetaTitleIndicator,
	MetaDescriptionIndicator,
} from "@/components/ui/char-count-indicator";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { toast } from "sonner";
import { Image as ImageIcon, X, GripVertical, Users } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TeamMember } from "@/lib/schemas/team-member";
import {
	getCouncilDisplayTitle,
	getConsultantDisplayTitle,
	getCourseInstructorDisplayTitle,
} from "@/lib/schemas/team-member";

// Helper to get display roles for a team member (admin always uses English)
function getMemberRoles(member: TeamMember): string[] {
	const roles: string[] = [];
	if (member.isCouncil) roles.push(getCouncilDisplayTitle(member, "en"));
	if (member.isConsultant) roles.push(getConsultantDisplayTitle(member, "en"));
	if (member.isCourseInstructor)
		roles.push(getCourseInstructorDisplayTitle(member, "en"));
	return roles;
}

// Sortable team member item component
function SortableTeamMemberItem({
	member,
}: {
	member: TeamMember & { _id: string };
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: member._id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const fullName = [member.firstName, member.lastName]
		.filter(Boolean)
		.join(" ");
	const roles = getMemberRoles(member);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-3 p-3 bg-background border rounded-lg"
		>
			<button
				type="button"
				className="cursor-grab active:cursor-grabbing touch-none"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</button>
			{member.picture ? (
				<img
					src={getMediaUrl(member.picture)}
					alt={fullName}
					className="h-10 w-10 rounded-full object-cover"
				/>
			) : (
				<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
					<Users className="h-5 w-5 text-muted-foreground" />
				</div>
			)}
			<div className="flex-1 min-w-0">
				<p className="font-medium truncate">{fullName}</p>
				{roles.length > 0 && (
					<p className="text-sm text-muted-foreground truncate">
						{roles.join(", ")}
					</p>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/admin/projects/$id")({
	component: ProjectEditorPage,
});

function ProjectEditorPage() {
	const { id } = useParams({ from: "/admin/projects/$id" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = id === "new";

	const { data: project, isLoading } = useQuery({
		queryKey: ["project", id],
		queryFn: () => getProject({ data: id }),
		enabled: !isNew,
		refetchOnWindowFocus: false,
	});

	// Fetch team members assigned to this project (only when editing)
	const { data: projectTeamMembers = [] } = useQuery({
		queryKey: ["teamMembersByProject", project?.slug],
		queryFn: () => getTeamMembersByProject({ data: project!.slug }),
		enabled: !isNew && !!project?.slug,
		refetchOnWindowFocus: false,
	});

	// State for ordered team members (managed separately from form)
	const [orderedMemberIds, setOrderedMemberIds] = useState<string[]>([]);

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const createMutation = useMutation({
		mutationFn: (data: unknown) => createProject({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			toast.success("Project created");
			navigate({ to: "/admin/projects" });
		},
		onError: (error) => {
			toast.error("Failed to create project", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: unknown }) =>
			updateProject({ data: { id, data } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["project", id] });
			toast.success("Project updated");
			navigate({ to: "/admin/projects" });
		},
		onError: (error) => {
			toast.error("Failed to update project", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			slug: "",
			name: "",
			metaTitle: "",
			metaDescription: "",
			shortDescription: "",
			longDescription: "",
			metaTitleDe: "",
			metaDescriptionDe: "",
			shortDescriptionDe: "",
			longDescriptionDe: "",
			logo: "",
			githubUrl: "",
			docsUrl: "",
			websiteUrl: "",
		},
		onSubmit: async ({ value }) => {
			// Include team member order when updating
			const dataWithOrder = {
				...value,
				teamMemberOrder: orderedMemberIds,
			};
			
			if (isNew) {
				createMutation.mutate(value);
			} else {
				updateMutation.mutate({ id, data: dataWithOrder });
			}
		},
	});

	// Track if form has been initialized to prevent overwriting user changes
	const hasInitializedRef = useRef(false);
	const hasInitializedMembersRef = useRef(false);

	// Update form when project loads - ONLY ONCE
	useEffect(() => {
		if (project && !isNew && !hasInitializedRef.current) {
			hasInitializedRef.current = true;
			form.setFieldValue("slug", project.slug);
			form.setFieldValue("name", project.name);
			form.setFieldValue("metaTitle", project.metaTitle);
			form.setFieldValue("metaDescription", project.metaDescription);
			form.setFieldValue("shortDescription", project.shortDescription);
			form.setFieldValue("longDescription", project.longDescription);
			form.setFieldValue("metaTitleDe", project.metaTitleDe || "");
			form.setFieldValue("metaDescriptionDe", project.metaDescriptionDe || "");
			form.setFieldValue("shortDescriptionDe", project.shortDescriptionDe || "");
			form.setFieldValue("longDescriptionDe", project.longDescriptionDe || "");
			form.setFieldValue("logo", project.logo || "");
			form.setFieldValue("githubUrl", project.githubUrl || "");
			form.setFieldValue("docsUrl", project.docsUrl || "");
			form.setFieldValue("websiteUrl", project.websiteUrl || "");
		}
	}, [project, isNew, form]);

	// Initialize ordered member IDs when team members and project load
	useEffect(() => {
		if (projectTeamMembers.length > 0 && project && !hasInitializedMembersRef.current) {
			hasInitializedMembersRef.current = true;
			
			// Use saved order if available, otherwise use all member IDs in fetch order
			const savedOrder = project.teamMemberOrder || [];
			const allMemberIds = projectTeamMembers.map((m) => m._id!);
			
			// Filter saved order to only include existing members, then add any new members
			const orderedIds = [
				...savedOrder.filter((id) => allMemberIds.includes(id)),
				...allMemberIds.filter((id) => !savedOrder.includes(id)),
			];
			
			setOrderedMemberIds(orderedIds);
		}
	}, [projectTeamMembers, project]);

	// Handle drag end
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		
		if (over && active.id !== over.id) {
			setOrderedMemberIds((items) => {
				const oldIndex = items.indexOf(active.id as string);
				const newIndex = items.indexOf(over.id as string);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	// Get sorted team members based on order
	const sortedTeamMembers = orderedMemberIds
		.map((id) => projectTeamMembers.find((m) => m._id === id))
		.filter(Boolean) as typeof projectTeamMembers;

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
					<h1 className="text-3xl font-bold">
						{isNew ? "New Project" : "Edit Project"}
					</h1>
					<p className="text-muted-foreground">
						{isNew ? "Add a new open source project" : "Edit project details"}
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					{/* Basic Info */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<form.Field name="name">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Project Name</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
												placeholder="e.g., sktime"
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="slug">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>URL Slug</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(
														e.target.value.toLowerCase().replace(/\s+/g, "-")
													)
												}
												disabled={isSubmitting}
												placeholder="e.g., sktime"
											/>
											<p className="text-xs text-muted-foreground">
												URL: /projects/{field.state.value || "slug"}
											</p>
										</div>
									)}
								</form.Field>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
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
											/>
											<MetaTitleIndicator value={field.state.value} />
										</div>
									)}
								</form.Field>

								<form.Field name="metaDescription">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Meta Description</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
											/>
											<MetaDescriptionIndicator value={field.state.value} />
										</div>
									)}
								</form.Field>
							</div>

							<form.Field name="shortDescription">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Short Description</Label>
										<Textarea
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											rows={2}
											placeholder="A brief description for the project listing (1-2 sentences)"
										/>
										<p className="text-xs text-muted-foreground">
											{field.state.value.length}/150 characters recommended
										</p>
									</div>
								)}
							</form.Field>

						<form.Field name="longDescription">
							{(field) => (
								<div className="space-y-2">
									<Label>Long Description</Label>
									<RichTextEditor
										value={field.state.value}
										onChange={(html) => field.handleChange(html)}
										placeholder="Write a detailed description of the project, its purpose, benefits, and how it helps users..."
										disabled={isSubmitting}
									/>
								</div>
							)}
						</form.Field>
					</CardContent>
				</Card>

				{/* German Content */}
				<Card>
					<CardHeader>
						<CardTitle>German Content (DE)</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<form.Field name="metaTitleDe">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Meta Title (DE)</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
										/>
										<MetaTitleIndicator value={field.state.value} />
									</div>
								)}
							</form.Field>

							<form.Field name="metaDescriptionDe">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Meta Description (DE)</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
										/>
										<MetaDescriptionIndicator value={field.state.value} />
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name="shortDescriptionDe">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Short Description (DE)</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isSubmitting}
										rows={2}
										placeholder="Eine kurze Beschreibung für die Projektübersicht (1-2 Sätze)"
									/>
									<p className="text-xs text-muted-foreground">
										{field.state.value.length}/150 characters recommended
									</p>
								</div>
							)}
						</form.Field>

						<form.Field name="longDescriptionDe">
							{(field) => (
								<div className="space-y-2">
									<Label>Long Description (DE)</Label>
									<RichTextEditor
										value={field.state.value}
										onChange={(html) => field.handleChange(html)}
										placeholder="Schreiben Sie eine ausführliche Beschreibung des Projekts, seinen Zweck, Vorteile und wie es den Nutzern hilft..."
										disabled={isSubmitting}
									/>
								</div>
							)}
						</form.Field>
					</CardContent>
				</Card>

				{/* Project Logo */}
					<Card>
						<CardHeader>
							<CardTitle>Project Logo</CardTitle>
						</CardHeader>
						<CardContent>
							<form.Field name="logo">
								{(field) => (
									<div className="space-y-2">
										<Label>Logo</Label>
										<div className="flex gap-4 items-start">
											{/* Logo Preview */}
											<div className="flex-shrink-0">
												{field.state.value ? (
													<div className="relative">
														<img
															src={getMediaUrl(field.state.value)}
															alt="Logo preview"
															className="h-24 w-24 object-contain border-2 border-border rounded-lg p-2 bg-white"
														/>
														<button
															type="button"
															onClick={() => field.handleChange("")}
															className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
															disabled={isSubmitting}
															title="Remove logo"
														>
															<X className="h-4 w-4" />
														</button>
													</div>
												) : (
													<div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
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
													Select a logo from your media library. You can upload new images in the{" "}
													<a
														href="/admin/media"
														target="_blank"
														className="text-primary hover:underline"
													>
														Media Library
													</a>
													.
												</p>
											</div>
										</div>
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

					{/* External Links */}
					<Card>
						<CardHeader>
							<CardTitle>External Links</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<form.Field name="githubUrl">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>GitHub Repository</Label>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="https://github.com/org/repo"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="docsUrl">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Documentation URL</Label>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="https://docs.example.com"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="websiteUrl">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Project Website</Label>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="https://example.com"
										/>
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

					{/* Team Members Order - Only show when editing */}
					{!isNew && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Team Members
								</CardTitle>
							</CardHeader>
							<CardContent>
								{sortedTeamMembers.length > 0 ? (
									<>
										<p className="text-sm text-muted-foreground mb-4">
											Drag and drop to reorder team members. The order will be used on the public project page.
										</p>
										<DndContext
											sensors={sensors}
											collisionDetection={closestCenter}
											onDragEnd={handleDragEnd}
										>
											<SortableContext
												items={orderedMemberIds}
												strategy={verticalListSortingStrategy}
											>
												<div className="space-y-2">
													{sortedTeamMembers.map((member) => (
														<SortableTeamMemberItem
															key={member._id}
															member={member}
														/>
													))}
												</div>
											</SortableContext>
										</DndContext>
									</>
								) : (
									<p className="text-sm text-muted-foreground">
										No team members assigned to this project yet.{" "}
										<a
											href="/admin/team-members"
											className="text-primary hover:underline"
										>
											Manage team members
										</a>{" "}
										to assign them to this project.
									</p>
								)}
							</CardContent>
						</Card>
					)}

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? "Saving..."
								: isNew
									? "Create Project"
									: "Update Project"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/projects" })}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

