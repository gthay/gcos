import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import {
	getTeamMembers,
	deleteTeamMember,
	getTeamPageConfig,
	updateTeamPageConfig,
} from "@/lib/server/team-members";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, GripVertical, Users } from "lucide-react";
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

export const Route = createFileRoute("/admin/team-members/")({
	component: TeamMembersPage,
});

// Helper to get roles display (admin always uses English)
function getRolesDisplay(member: TeamMember): string[] {
	const roles: string[] = [];
	if (member.isCouncil) roles.push(getCouncilDisplayTitle(member, "en"));
	if (member.isConsultant) roles.push(getConsultantDisplayTitle(member, "en"));
	if (member.isCourseInstructor)
		roles.push(getCourseInstructorDisplayTitle(member, "en"));
	return roles;
}

// Sortable item component
function SortableTeamMemberRow({
	member,
	roleDisplay,
	onEdit,
	onDelete,
}: {
	member: TeamMember & { _id: string };
	roleDisplay: string;
	onEdit: () => void;
	onDelete: () => void;
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

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-3 p-3 bg-background border rounded-lg mb-2"
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
				<p className="text-sm text-muted-foreground truncate">{roleDisplay}</p>
			</div>
			<div className="flex gap-2">
				<Button variant="ghost" size="icon" onClick={onEdit}>
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
								Are you sure you want to delete "{fullName}"? This action cannot
								be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={onDelete}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

function TeamMembersPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: members = [], isLoading } = useQuery({
		queryKey: ["teamMembers"],
		queryFn: () => getTeamMembers(),
	});

	const { data: teamPageConfig } = useQuery({
		queryKey: ["teamPageConfig"],
		queryFn: () => getTeamPageConfig(),
	});

	// Local state for sorting
	const [councilOrder, setCouncilOrder] = useState<string[]>([]);
	const [consultantOrder, setConsultantOrder] = useState<string[]>([]);
	const [courseInstructorOrder, setCourseInstructorOrder] = useState<string[]>(
		[]
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Initialize orders from config when loaded
	useEffect(() => {
		if (teamPageConfig) {
			setCouncilOrder(teamPageConfig.councilMemberOrder || []);
			setConsultantOrder(teamPageConfig.consultantOrder || []);
			setCourseInstructorOrder(teamPageConfig.courseInstructorOrder || []);
		}
	}, [teamPageConfig]);

	// Filter members by role
	const councilMembers = members.filter((m) => m.isCouncil);
	const consultants = members.filter((m) => m.isConsultant);
	const courseInstructors = members.filter((m) => m.isCourseInstructor);

	// Get sorted members
	const getSortedMembers = (
		memberList: typeof members,
		orderArray: string[]
	) => {
		const orderMap = new Map(orderArray.map((id, index) => [id, index]));
		return [...memberList].sort((a, b) => {
			const aIndex = orderMap.get(a._id!) ?? Number.MAX_SAFE_INTEGER;
			const bIndex = orderMap.get(b._id!) ?? Number.MAX_SAFE_INTEGER;
			return aIndex - bIndex;
		});
	};

	const sortedCouncilMembers = getSortedMembers(
		councilMembers,
		councilOrder.length > 0
			? councilOrder
			: teamPageConfig?.councilMemberOrder || []
	);
	const sortedConsultants = getSortedMembers(
		consultants,
		consultantOrder.length > 0
			? consultantOrder
			: teamPageConfig?.consultantOrder || []
	);
	const sortedCourseInstructors = getSortedMembers(
		courseInstructors,
		courseInstructorOrder.length > 0
			? courseInstructorOrder
			: teamPageConfig?.courseInstructorOrder || []
	);

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteTeamMember({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
			toast.success("Team member deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete team member", {
				description:
					error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const updateConfigMutation = useMutation({
		mutationFn: (data: {
			councilMemberOrder?: string[];
			consultantOrder?: string[];
			courseInstructorOrder?: string[];
		}) => updateTeamPageConfig({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["teamPageConfig"] });
			toast.success("Sort order saved");
			setHasUnsavedChanges(false);
		},
		onError: (error) => {
			toast.error("Failed to save sort order", {
				description:
					error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const handleCouncilDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const currentOrder =
				councilOrder.length > 0
					? councilOrder
					: sortedCouncilMembers.map((m) => m._id!);
			const oldIndex = currentOrder.indexOf(active.id as string);
			const newIndex = currentOrder.indexOf(over.id as string);
			const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
			setCouncilOrder(newOrder);
			setHasUnsavedChanges(true);
		}
	};

	const handleConsultantDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const currentOrder =
				consultantOrder.length > 0
					? consultantOrder
					: sortedConsultants.map((m) => m._id!);
			const oldIndex = currentOrder.indexOf(active.id as string);
			const newIndex = currentOrder.indexOf(over.id as string);
			const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
			setConsultantOrder(newOrder);
			setHasUnsavedChanges(true);
		}
	};

	const handleCourseInstructorDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const currentOrder =
				courseInstructorOrder.length > 0
					? courseInstructorOrder
					: sortedCourseInstructors.map((m) => m._id!);
			const oldIndex = currentOrder.indexOf(active.id as string);
			const newIndex = currentOrder.indexOf(over.id as string);
			const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
			setCourseInstructorOrder(newOrder);
			setHasUnsavedChanges(true);
		}
	};

	const handleSaveOrder = () => {
		updateConfigMutation.mutate({
			councilMemberOrder:
				councilOrder.length > 0
					? councilOrder
					: sortedCouncilMembers.map((m) => m._id!),
			consultantOrder:
				consultantOrder.length > 0
					? consultantOrder
					: sortedConsultants.map((m) => m._id!),
			courseInstructorOrder:
				courseInstructorOrder.length > 0
					? courseInstructorOrder
					: sortedCourseInstructors.map((m) => m._id!),
		});
	};

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
						<h1 className="text-3xl font-bold">Team</h1>
						<p className="text-muted-foreground">
							Manage your team members and their order on the team page
						</p>
					</div>
					<div className="flex gap-2">
						{hasUnsavedChanges && (
							<Button onClick={handleSaveOrder} variant="default">
								Save Order
							</Button>
						)}
						<Button onClick={() => navigate({ to: "/admin/team-members/new" })}>
							<Plus className="mr-2 h-4 w-4" />
							New Member
						</Button>
					</div>
				</div>

				<Tabs defaultValue="all">
					<TabsList>
						<TabsTrigger value="all">
							All Members ({members.length})
						</TabsTrigger>
						<TabsTrigger value="council">
							Council ({councilMembers.length})
						</TabsTrigger>
						<TabsTrigger value="consultants">
							Consultants ({consultants.length})
						</TabsTrigger>
						<TabsTrigger value="instructors">
							Instructors ({courseInstructors.length})
						</TabsTrigger>
					</TabsList>

					{/* All Members Tab */}
					<TabsContent value="all">
						{members.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-muted-foreground mb-4">
									No team members yet.
								</p>
								<Button
									onClick={() => navigate({ to: "/admin/team-members/new" })}
								>
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
											<TableHead>Roles</TableHead>
											<TableHead>Projects</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{members.map((member) => {
											const fullName = [member.firstName, member.lastName]
												.filter(Boolean)
												.join(" ");
											const roles = getRolesDisplay(member);
											return (
												<TableRow key={member._id}>
													<TableCell>
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
													</TableCell>
													<TableCell className="font-medium">
														{fullName || "—"}
													</TableCell>
													<TableCell>
														<div className="flex flex-wrap gap-1">
															{roles.length > 0
																? roles.map((role) => (
																		<span
																			key={role}
																			className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
																		>
																			{role}
																		</span>
																	))
																: "—"}
														</div>
													</TableCell>
													<TableCell>
														<div className="flex flex-wrap gap-1">
															{member.projects && member.projects.length > 0
																? member.projects.map((project) => (
																		<span
																			key={project}
																			className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
																		>
																			{project}
																		</span>
																	))
																: "—"}
														</div>
													</TableCell>
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	navigate({
																		to: `/admin/team-members/${member._id}`,
																	})
																}
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
																		<AlertDialogTitle>
																			Delete Team Member
																		</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete "
																			{fullName}"? This action cannot be undone.
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
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</TabsContent>

					{/* Council Members Tab with Sorting */}
					<TabsContent value="council">
						<Card>
							<CardHeader>
								<CardTitle>Council Members Order</CardTitle>
							</CardHeader>
							<CardContent>
								{councilMembers.length === 0 ? (
									<p className="text-muted-foreground">
										No council members yet. Enable "Council Member" when
										creating/editing team members.
									</p>
								) : (
									<>
										<p className="text-sm text-muted-foreground mb-4">
											Drag and drop to reorder council members on the team
											page.
										</p>
										<DndContext
											sensors={sensors}
											collisionDetection={closestCenter}
											onDragEnd={handleCouncilDragEnd}
										>
											<SortableContext
												items={sortedCouncilMembers.map((m) => m._id!)}
												strategy={verticalListSortingStrategy}
											>
												{sortedCouncilMembers.map((member) => (
													<SortableTeamMemberRow
														key={member._id}
														member={member as TeamMember & { _id: string }}
														roleDisplay={getCouncilDisplayTitle(member, "en")}
														onEdit={() =>
															navigate({
																to: `/admin/team-members/${member._id}`,
															})
														}
														onDelete={() => handleDelete(member._id!)}
													/>
												))}
											</SortableContext>
										</DndContext>
									</>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Consultants Tab with Sorting */}
					<TabsContent value="consultants">
						<Card>
							<CardHeader>
								<CardTitle>Consultants Order</CardTitle>
							</CardHeader>
							<CardContent>
								{consultants.length === 0 ? (
									<p className="text-muted-foreground">
										No consultants yet. Enable "Consultant" when creating/editing
										team members.
									</p>
								) : (
									<>
										<p className="text-sm text-muted-foreground mb-4">
											Drag and drop to reorder consultants on the team page.
										</p>
										<DndContext
											sensors={sensors}
											collisionDetection={closestCenter}
											onDragEnd={handleConsultantDragEnd}
										>
											<SortableContext
												items={sortedConsultants.map((m) => m._id!)}
												strategy={verticalListSortingStrategy}
											>
												{sortedConsultants.map((member) => (
													<SortableTeamMemberRow
														key={member._id}
														member={member as TeamMember & { _id: string }}
														roleDisplay={getConsultantDisplayTitle(member, "en")}
														onEdit={() =>
															navigate({
																to: `/admin/team-members/${member._id}`,
															})
														}
														onDelete={() => handleDelete(member._id!)}
													/>
												))}
											</SortableContext>
										</DndContext>
									</>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Course Instructors Tab with Sorting */}
					<TabsContent value="instructors">
						<Card>
							<CardHeader>
								<CardTitle>Course Instructors Order</CardTitle>
							</CardHeader>
							<CardContent>
								{courseInstructors.length === 0 ? (
									<p className="text-muted-foreground">
										No course instructors yet. Enable "Course Instructor" when
										creating/editing team members.
									</p>
								) : (
									<>
										<p className="text-sm text-muted-foreground mb-4">
											Drag and drop to reorder course instructors on the team
											page.
										</p>
										<DndContext
											sensors={sensors}
											collisionDetection={closestCenter}
											onDragEnd={handleCourseInstructorDragEnd}
										>
											<SortableContext
												items={sortedCourseInstructors.map((m) => m._id!)}
												strategy={verticalListSortingStrategy}
											>
												{sortedCourseInstructors.map((member) => (
													<SortableTeamMemberRow
														key={member._id}
														member={member as TeamMember & { _id: string }}
														roleDisplay={getCourseInstructorDisplayTitle(member, "en")}
														onEdit={() =>
															navigate({
																to: `/admin/team-members/${member._id}`,
															})
														}
														onDelete={() => handleDelete(member._id!)}
													/>
												))}
											</SortableContext>
										</DndContext>
									</>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}
