import { createFileRoute, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import {
	getTeamMember,
	createTeamMember,
	updateTeamMember,
} from "@/lib/server/team-members";
import { getProjects } from "@/lib/server/projects";
import { teamMemberCreateSchema } from "@/lib/schemas/team-member";
import type { TeamMember } from "@/lib/schemas/team-member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { getMediaUrl } from "@/lib/media-utils";

// Helper to extract error message from Zod validation errors
function getErrorMessage(error: unknown): string {
	if (typeof error === "string") return error;
	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}
	return "Invalid value";
}

// Wrapper component that handles data fetching
function TeamMemberEditorPage() {
	const { id } = useParams({ from: "/admin/team-members/$id" });
	const isNew = id === "new";

	const { data: member, isLoading } = useQuery({
		queryKey: ["teamMember", id],
		queryFn: () => getTeamMember({ data: id }),
		enabled: !isNew,
		refetchOnWindowFocus: false,
	});

	// Show loading while data is being fetched
	if (!isNew && (isLoading || !member)) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</DashboardLayout>
		);
	}

	// Render form with key to force remount on id change
	return <TeamMemberForm key={id} id={id} member={member} isNew={isNew} />;
}

// Form component that receives data as props
function TeamMemberForm({
	id,
	member,
	isNew,
}: {
	id: string;
	member?: TeamMember;
	isNew: boolean;
}) {
	const queryClient = useQueryClient();

	// Load projects from database
	const { data: projects = [] } = useQuery({
		queryKey: ["projects"],
		queryFn: () => getProjects(),
	});

	const createMutation = useMutation({
		mutationFn: (data: unknown) => createTeamMember({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
			toast.success("Team member created");
			window.location.href = "/admin/team-members";
		},
		onError: (error) => {
			toast.error("Failed to create team member", {
				description:
					error instanceof Error ? error.message : "An error occurred",
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
			window.location.href = "/admin/team-members";
		},
		onError: (error) => {
			toast.error("Failed to update team member", {
				description:
					error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	// Initialize form with member data directly - NO useEffect needed!
	const form = useForm({
		defaultValues: {
			picture: member?.picture || "",
			firstName: member?.firstName || "",
			lastName: member?.lastName || "",
			affiliation: member?.affiliation || "",
			isCouncil: member?.isCouncil || false,
			councilTitle: member?.councilTitle || "",
			councilTitleDe: member?.councilTitleDe || "",
			isConsultant: member?.isConsultant || false,
			consultantTitle: member?.consultantTitle || "",
			consultantTitleDe: member?.consultantTitleDe || "",
			isCourseInstructor: member?.isCourseInstructor || false,
			courseInstructorTitle: member?.courseInstructorTitle || "",
			courseInstructorTitleDe: member?.courseInstructorTitleDe || "",
			projects: member?.projects || ([] as string[]),
			projectTitles:
				member?.projectTitles ||
				({} as Record<string, { titleEn?: string; titleDe?: string }>),
			githubUrl: member?.githubUrl || "",
			linkedinUrl: member?.linkedinUrl || "",
			websiteUrl: member?.websiteUrl || "",
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
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Profile Picture */}
							<form.Field name="picture">
								{(field) => (
									<div className="space-y-2">
										<Label>Profile Picture *</Label>
										<div className="flex gap-4 items-start">
											<div className="flex-shrink-0">
												{field.state.value ? (
													<div className="relative">
														<img
															src={getMediaUrl(field.state.value)}
															alt="Profile preview"
															className="h-24 w-24 rounded-full object-cover border-2 border-border"
															onError={(e) => {
																e.currentTarget.src =
																	"/images/Profile-Picture-Placeholder.webp";
															}}
														/>
														<button
															type="button"
															onClick={() => field.handleChange("")}
															className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
															disabled={isSubmitting}
														>
															<X className="h-4 w-4" />
														</button>
													</div>
												) : (
													<div className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
														<ImageIcon className="h-8 w-8 text-muted-foreground" />
													</div>
												)}
											</div>
											<div className="flex-1">
												<MediaPicker
													value={field.state.value}
													onSelect={(url) => field.handleChange(url)}
													disabled={isSubmitting}
												/>
												{field.state.meta.errors.length > 0 && (
													<p className="text-sm text-destructive mt-2">
														{getErrorMessage(field.state.meta.errors[0])}
													</p>
												)}
											</div>
										</div>
									</div>
								)}
							</form.Field>

							{/* Name Fields */}
							<div className="grid gap-4 md:grid-cols-2">
								<form.Field name="firstName">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>First Name *</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
												placeholder="e.g. Franz"
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-destructive">
													{getErrorMessage(field.state.meta.errors[0])}
												</p>
											)}
										</div>
									)}
								</form.Field>

								<form.Field name="lastName">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Last Name</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
												placeholder="e.g. Kiraly"
											/>
										</div>
									)}
								</form.Field>
							</div>

							{/* Affiliation */}
							<form.Field name="affiliation">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Affiliation (optional)</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="e.g. Electrolux, Google, University of Munich"
										/>
										<p className="text-xs text-muted-foreground">
											Company or organization this person is affiliated with
										</p>
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

					{/* Roles */}
					<Card>
						<CardHeader>
							<CardTitle>Roles</CardTitle>
						</CardHeader>
						<CardContent className="space-y-8">
							{/* Council */}
							<div className="space-y-4">
								<form.Field name="isCouncil">
									{(field) => (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="isCouncil"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(checked === true)
												}
												disabled={isSubmitting}
											/>
											<Label htmlFor="isCouncil" className="cursor-pointer">
												Council Member / Beiratsmitglied
											</Label>
										</div>
									)}
								</form.Field>
								<form.Subscribe selector={(state) => state.values.isCouncil}>
									{(isCouncil) =>
										isCouncil && (
											<div className="ml-6 grid gap-4 md:grid-cols-2">
												<form.Field name="councilTitle">
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={field.name}>Title (EN)</Label>
															<Input
																id={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isSubmitting}
																placeholder="Council Member"
															/>
															<p className="text-xs text-muted-foreground">
																Default: "Council Member"
															</p>
														</div>
													)}
												</form.Field>
												<form.Field name="councilTitleDe">
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={field.name}>Titel (DE)</Label>
															<Input
																id={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isSubmitting}
																placeholder="Beiratsmitglied"
															/>
															<p className="text-xs text-muted-foreground">
																Standard: "Beiratsmitglied"
															</p>
														</div>
													)}
												</form.Field>
											</div>
										)
									}
								</form.Subscribe>
							</div>

							{/* Consultant */}
							<div className="space-y-4">
								<form.Field name="isConsultant">
									{(field) => (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="isConsultant"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(checked === true)
												}
												disabled={isSubmitting}
											/>
											<Label htmlFor="isConsultant" className="cursor-pointer">
												Consultant / Berater
											</Label>
										</div>
									)}
								</form.Field>
								<form.Subscribe selector={(state) => state.values.isConsultant}>
									{(isConsultant) =>
										isConsultant && (
											<div className="ml-6 grid gap-4 md:grid-cols-2">
												<form.Field name="consultantTitle">
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={field.name}>Title (EN)</Label>
															<Input
																id={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isSubmitting}
																placeholder="e.g. Automation Expert"
															/>
															<p className="text-xs text-muted-foreground">
																Default: "Consultant"
															</p>
														</div>
													)}
												</form.Field>
												<form.Field name="consultantTitleDe">
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={field.name}>Titel (DE)</Label>
															<Input
																id={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isSubmitting}
																placeholder="z.B. Automatisierungsexperte"
															/>
															<p className="text-xs text-muted-foreground">
																Standard: "Berater"
															</p>
														</div>
													)}
												</form.Field>
											</div>
										)
									}
								</form.Subscribe>
							</div>

							{/* Course Instructor */}
							<div className="space-y-4">
								<form.Field name="isCourseInstructor">
									{(field) => (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="isCourseInstructor"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(checked === true)
												}
												disabled={isSubmitting}
											/>
											<Label
												htmlFor="isCourseInstructor"
												className="cursor-pointer"
											>
												Course Instructor / Kursleiter
											</Label>
										</div>
									)}
								</form.Field>
								<form.Subscribe
									selector={(state) => state.values.isCourseInstructor}
								>
									{(isCourseInstructor) =>
										isCourseInstructor && (
											<div className="ml-6 grid gap-4 md:grid-cols-2">
												<form.Field name="courseInstructorTitle">
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={field.name}>Title (EN)</Label>
															<Input
																id={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isSubmitting}
																placeholder="e.g. n8n courses"
															/>
															<p className="text-xs text-muted-foreground">
																Default: "Course Instructor"
															</p>
														</div>
													)}
												</form.Field>
												<form.Field name="courseInstructorTitleDe">
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={field.name}>Titel (DE)</Label>
															<Input
																id={field.name}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isSubmitting}
																placeholder="z.B. n8n Kurse"
															/>
															<p className="text-xs text-muted-foreground">
																Standard: "Kursleiter"
															</p>
														</div>
													)}
												</form.Field>
											</div>
										)
									}
								</form.Subscribe>
							</div>
						</CardContent>
					</Card>

					{/* Projects */}
					<Card>
						<CardHeader>
							<CardTitle>Projects</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<form.Field name="projects">
								{(field) => (
									<div className="space-y-4">
										<p className="text-sm text-muted-foreground">
											Select projects this person contributes to (optional).
										</p>
										{projects.length > 0 ? (
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
												{projects.map((project) => {
													const isChecked = field.state.value.includes(
														project.slug
													);
													return (
														<div
															key={project.slug}
															className="flex items-center space-x-2"
														>
															<Checkbox
																id={`project-${project.slug}`}
																checked={isChecked}
																onCheckedChange={(checked) => {
																	if (checked) {
																		field.handleChange([
																			...field.state.value,
																			project.slug,
																		]);
																	} else {
																		field.handleChange(
																			field.state.value.filter(
																				(p) => p !== project.slug
																			)
																		);
																	}
																}}
																disabled={isSubmitting}
															/>
															<Label
																htmlFor={`project-${project.slug}`}
																className="text-sm font-normal cursor-pointer"
															>
																{project.name}
															</Label>
														</div>
													);
												})}
											</div>
										) : (
											<p className="text-sm text-muted-foreground italic">
												No projects available. Create projects in the Projects
												section first.
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Project-specific titles */}
							<form.Subscribe selector={(state) => state.values.projects}>
								{(selectedProjects) =>
									selectedProjects.length > 0 && (
										<div className="space-y-6 pt-4 border-t">
											<div>
												<h4 className="text-sm font-medium mb-1">
													Project Titles
												</h4>
												<p className="text-sm text-muted-foreground">
													Set custom titles for each project (optional).
												</p>
											</div>
											{selectedProjects.map((projectSlug) => {
												const project = projects.find(
													(p) => p.slug === projectSlug
												);
												if (!project) return null;
												return (
													<div
														key={projectSlug}
														className="space-y-3 p-4 bg-muted/50 rounded-lg"
													>
														<h5 className="font-medium text-sm">
															{project.name}
														</h5>
														<div className="grid gap-4 md:grid-cols-2">
															<form.Field
																name="projectTitles"
																children={(field) => (
																	<div className="space-y-2">
																		<Label>Title (EN)</Label>
																		<Input
																			value={
																				field.state.value[projectSlug]
																					?.titleEn || ""
																			}
																			onChange={(e) => {
																				const newTitles = {
																					...field.state.value,
																					[projectSlug]: {
																						...field.state.value[projectSlug],
																						titleEn: e.target.value,
																					},
																				};
																				field.handleChange(newTitles);
																			}}
																			disabled={isSubmitting}
																			placeholder="Developer"
																		/>
																	</div>
																)}
															/>
															<form.Field
																name="projectTitles"
																children={(field) => (
																	<div className="space-y-2">
																		<Label>Titel (DE)</Label>
																		<Input
																			value={
																				field.state.value[projectSlug]
																					?.titleDe || ""
																			}
																			onChange={(e) => {
																				const newTitles = {
																					...field.state.value,
																					[projectSlug]: {
																						...field.state.value[projectSlug],
																						titleDe: e.target.value,
																					},
																				};
																				field.handleChange(newTitles);
																			}}
																			disabled={isSubmitting}
																			placeholder="Entwickler"
																		/>
																	</div>
																)}
															/>
														</div>
													</div>
												);
											})}
										</div>
									)
								}
							</form.Subscribe>
						</CardContent>
					</Card>

					{/* Social Links */}
					<Card>
						<CardHeader>
							<CardTitle>Social Links</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<form.Field name="githubUrl">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>GitHub URL</Label>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="https://github.com/username"
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-sm text-destructive">
												{getErrorMessage(field.state.meta.errors[0])}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name="linkedinUrl">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>LinkedIn URL</Label>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="https://linkedin.com/in/username"
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-sm text-destructive">
												{getErrorMessage(field.state.meta.errors[0])}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name="websiteUrl">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Personal Website</Label>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											disabled={isSubmitting}
											placeholder="https://example.com"
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-sm text-destructive">
												{getErrorMessage(field.state.meta.errors[0])}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

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
							onClick={() => {
								window.location.href = "/admin/team-members";
							}}
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
