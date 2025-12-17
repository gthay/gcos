import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getCourse, createCourse, updateCourse } from "@/lib/server/courses";
import type { CourseHost, LearningTopic } from "@/lib/schemas/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MetaTitleIndicator, MetaDescriptionIndicator } from "@/components/ui/char-count-indicator";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/courses/$id")({
	component: CourseEditorPage,
});

function CourseEditorPage() {
	const { id } = useParams({ from: "/admin/courses/$id" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = id === "new";

	const [hosts, setHosts] = useState<CourseHost[]>([
		{ image: "", title: "", description: "" },
	]);

	const [learningTopics, setLearningTopics] = useState<LearningTopic[]>([
		{ title: "", items: [""] },
	]);

	const { data: course, isLoading } = useQuery({
		queryKey: ["course", id],
		queryFn: () => getCourse({ data: id }),
		enabled: !isNew,
	});

	const createMutation = useMutation({
		mutationFn: (data: unknown) => createCourse({ data }),
		onSuccess: (newId) => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			toast.success("Course created");
			navigate({ to: `/admin/courses/${newId}` });
		},
		onError: (error) => {
			toast.error("Failed to create course", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: unknown }) =>
			updateCourse({ data: { id, data } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			queryClient.invalidateQueries({ queryKey: ["course", id] });
			toast.success("Course updated");
		},
		onError: (error) => {
			toast.error("Failed to update course", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			h1: "",
			metaTitle: "",
			metaDescription: "",
			shortDescription: "",
			longDescription: "",
			featuredImage: "",
			dateTime: "",
			location: "",
		},
		onSubmit: async ({ value }) => {
			// Filter out empty learning topics
			const filteredTopics = learningTopics
				.filter((topic) => topic.title.trim() !== "")
				.map((topic) => ({
					...topic,
					items: topic.items.filter((item) => item.trim() !== ""),
				}))
				.filter((topic) => topic.items.length > 0);

			const data = {
				...value,
				hosts,
				learningTopics: filteredTopics.length > 0 ? filteredTopics : undefined,
			};
			if (isNew) {
				createMutation.mutate(data);
			} else {
				updateMutation.mutate({ id, data });
			}
		},
	});

	// Update form when course loads
	useEffect(() => {
		if (course && !isNew) {
			form.setFieldValue("h1", course.h1);
			form.setFieldValue("metaTitle", course.metaTitle);
			form.setFieldValue("metaDescription", course.metaDescription);
			form.setFieldValue("shortDescription", course.shortDescription);
			form.setFieldValue("longDescription", course.longDescription);
			form.setFieldValue("featuredImage", course.featuredImage || "");
			form.setFieldValue("dateTime", course.dateTime);
			form.setFieldValue("location", course.location);
			if (course.hosts && course.hosts.length > 0) {
				setHosts(course.hosts);
			}
			if (course.learningTopics && course.learningTopics.length > 0) {
				setLearningTopics(course.learningTopics);
			}
		}
	}, [course, isNew, form]);

	const addHost = () => {
		setHosts([...hosts, { image: "", title: "", description: "" }]);
	};

	const removeHost = (index: number) => {
		if (hosts.length > 1) {
			setHosts(hosts.filter((_, i) => i !== index));
		}
	};

	const updateHost = (index: number, field: keyof CourseHost, value: string) => {
		const newHosts = [...hosts];
		newHosts[index] = { ...newHosts[index], [field]: value };
		setHosts(newHosts);
	};

	// Learning Topics handlers
	const addLearningTopic = () => {
		setLearningTopics([...learningTopics, { title: "", items: [""] }]);
	};

	const removeLearningTopic = (index: number) => {
		if (learningTopics.length > 1) {
			setLearningTopics(learningTopics.filter((_, i) => i !== index));
		}
	};

	const updateLearningTopicTitle = (index: number, title: string) => {
		const newTopics = [...learningTopics];
		newTopics[index] = { ...newTopics[index], title };
		setLearningTopics(newTopics);
	};

	const addLearningItem = (topicIndex: number) => {
		const newTopics = [...learningTopics];
		newTopics[topicIndex] = {
			...newTopics[topicIndex],
			items: [...newTopics[topicIndex].items, ""],
		};
		setLearningTopics(newTopics);
	};

	const removeLearningItem = (topicIndex: number, itemIndex: number) => {
		const newTopics = [...learningTopics];
		if (newTopics[topicIndex].items.length > 1) {
			newTopics[topicIndex] = {
				...newTopics[topicIndex],
				items: newTopics[topicIndex].items.filter((_, i) => i !== itemIndex),
			};
			setLearningTopics(newTopics);
		}
	};

	const updateLearningItem = (topicIndex: number, itemIndex: number, value: string) => {
		const newTopics = [...learningTopics];
		const newItems = [...newTopics[topicIndex].items];
		newItems[itemIndex] = value;
		newTopics[topicIndex] = { ...newTopics[topicIndex], items: newItems };
		setLearningTopics(newTopics);
	};

	const moveLearningTopic = (index: number, direction: "up" | "down") => {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= learningTopics.length) return;
		const newTopics = [...learningTopics];
		[newTopics[index], newTopics[newIndex]] = [newTopics[newIndex], newTopics[index]];
		setLearningTopics(newTopics);
	};

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
						{isNew ? "New Course" : "Edit Course"}
					</h1>
					<p className="text-muted-foreground">
						{isNew ? "Create a new course" : "Edit your course"}
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
										/>
									</div>
								)}
							</form.Field>

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
											rows={3}
										/>
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
											placeholder="Write a detailed description of the course..."
											disabled={isSubmitting}
										/>
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

					{/* Featured Image */}
					<Card>
						<CardHeader>
							<CardTitle>Featured Image</CardTitle>
						</CardHeader>
						<CardContent>
							<form.Field name="featuredImage">
								{(field) => (
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor={field.name}>Image URL</Label>
											<Input
												id={field.name}
												type="url"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
												placeholder="https://example.com/course-image.jpg"
											/>
											<p className="text-xs text-muted-foreground">
												Recommended size: 1200x630px (16:9 aspect ratio) for optimal display
											</p>
										</div>
										{field.state.value && (
											<div className="relative overflow-hidden rounded-lg border bg-muted">
												<img
													src={field.state.value}
													alt="Featured image preview"
													className="w-full max-h-[300px] object-cover"
													onError={(e) => {
														e.currentTarget.style.display = "none";
														e.currentTarget.nextElementSibling?.classList.remove("hidden");
													}}
												/>
												<div className="hidden absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
													Failed to load image
												</div>
											</div>
										)}
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>

					{/* Date, Time & Location */}
					<Card>
						<CardHeader>
							<CardTitle>Date, Time & Location</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<form.Field name="dateTime">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Date and Time</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
												aria-invalid={field.state.meta.errors.length > 0}
												placeholder="e.g., December 15, 2025 at 10:00 AM CET"
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								<form.Field name="location">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Location</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isSubmitting}
												aria-invalid={field.state.meta.errors.length > 0}
												placeholder="e.g., Online or Berlin, Germany"
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>
							</div>
						</CardContent>
					</Card>

					{/* Hosts */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Hosts</CardTitle>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addHost}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Host
							</Button>
						</CardHeader>
						<CardContent className="space-y-6">
							{hosts.map((host, index) => (
								<div
									key={index}
									className="relative rounded-lg border p-4 space-y-4"
								>
									{hosts.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute right-2 top-2"
											onClick={() => removeHost(index)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									)}

									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label>Host Title / Name</Label>
											<Input
												value={host.title}
												onChange={(e) =>
													updateHost(index, "title", e.target.value)
												}
												disabled={isSubmitting}
												placeholder="e.g., Dr. Jane Smith"
											/>
										</div>

										<div className="space-y-2">
											<Label>Host Image URL</Label>
											<Input
												type="url"
												value={host.image}
												onChange={(e) =>
													updateHost(index, "image", e.target.value)
												}
												disabled={isSubmitting}
												placeholder="https://example.com/image.jpg"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Host Description</Label>
										<Textarea
											value={host.description}
											onChange={(e) =>
												updateHost(index, "description", e.target.value)
											}
											disabled={isSubmitting}
											rows={2}
											placeholder="Brief description of the host..."
										/>
									</div>

									{host.image && (
										<div className="mt-2">
											<img
												src={host.image}
												alt={host.title || "Host preview"}
												className="h-16 w-16 rounded-full object-cover border"
												onError={(e) => {
													e.currentTarget.style.display = "none";
												}}
											/>
										</div>
									)}
								</div>
							))}
						</CardContent>
					</Card>

					{/* What you will learn */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>What you will learn</CardTitle>
								<p className="text-sm text-muted-foreground mt-1">
									Add topics with bullet points to show what participants will learn
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addLearningTopic}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Topic
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{learningTopics.map((topic, topicIndex) => (
								<div
									key={topicIndex}
									className="rounded-lg border bg-card"
								>
									{/* Topic Header */}
									<div className="flex items-center gap-2 p-4 border-b bg-muted/30">
										<GripVertical className="h-4 w-4 text-muted-foreground" />
										<Input
											value={topic.title}
											onChange={(e) =>
												updateLearningTopicTitle(topicIndex, e.target.value)
											}
											disabled={isSubmitting}
											placeholder="Topic title (e.g., Diagnose data and learning task accurately)"
											className="flex-1 font-semibold border-0 bg-transparent focus-visible:ring-0 px-0"
										/>
										<div className="flex items-center gap-1">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => moveLearningTopic(topicIndex, "up")}
												disabled={topicIndex === 0}
												className="h-8 w-8"
											>
												<ChevronUp className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => moveLearningTopic(topicIndex, "down")}
												disabled={topicIndex === learningTopics.length - 1}
												className="h-8 w-8"
											>
												<ChevronDown className="h-4 w-4" />
											</Button>
											{learningTopics.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeLearningTopic(topicIndex)}
													className="h-8 w-8 text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>

									{/* Topic Items */}
									<div className="p-4 space-y-2">
										{topic.items.map((item, itemIndex) => (
											<div key={itemIndex} className="flex items-center gap-2">
												<div className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
												<Input
													value={item}
													onChange={(e) =>
														updateLearningItem(topicIndex, itemIndex, e.target.value)
													}
													disabled={isSubmitting}
													placeholder="Learning point..."
													className="flex-1"
												/>
												{topic.items.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeLearningItem(topicIndex, itemIndex)}
														className="h-8 w-8 text-muted-foreground hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
										))}
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => addLearningItem(topicIndex)}
											className="mt-2 text-muted-foreground"
										>
											<Plus className="mr-2 h-4 w-4" />
											Add bullet point
										</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? "Saving..."
								: isNew
									? "Create Course"
									: "Update Course"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/courses" })}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

