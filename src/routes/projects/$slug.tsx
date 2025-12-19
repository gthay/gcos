import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { getProjectBySlug } from "@/lib/server/projects";
import { getTeamMembersByProject } from "@/lib/server/team-members";
import { localizeHref } from "@/paraglide/runtime.js";
import * as m from "@/paraglide/messages";
import { Github, BookOpen, Globe, ArrowLeft, Users } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";
import type { TeamMember } from "@/lib/schemas/team-member";
import {
	getCouncilDisplayTitle,
	getConsultantDisplayTitle,
	getCourseInstructorDisplayTitle,
	getProjectDisplayTitle,
} from "@/lib/schemas/team-member";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/projects/$slug")({
	component: ProjectDetailPageContent,
});

// Helper to get display roles for a team member
function getMemberRoles(member: TeamMember, locale: string): string[] {
	const roles: string[] = [];
	if (member.isCouncil) roles.push(getCouncilDisplayTitle(member, locale));
	if (member.isConsultant)
		roles.push(getConsultantDisplayTitle(member, locale));
	if (member.isCourseInstructor)
		roles.push(getCourseInstructorDisplayTitle(member, locale));
	return roles;
}

export function ProjectDetailPageContent() {
	const { slug } = useParams({ from: "/projects/$slug" });
	const locale = useLocale();

	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-project", slug],
		queryFn: () => getProjectBySlug({ data: slug }),
	});

	// Fetch team members for this project
	const { data: teamMembers = [] } = useQuery({
		queryKey: ["public-team-members", slug],
		queryFn: () => getTeamMembersByProject({ data: slug }),
		enabled: !!project,
	});

	// Sort team members by the project's saved order
	const sortedTeamMembers = project?.teamMemberOrder
		? [
				// First: members in the saved order
				...project.teamMemberOrder
					.map((id) => teamMembers.find((m) => m._id === id))
					.filter(Boolean),
				// Then: any members not in the saved order
				...teamMembers.filter(
					(m) => !project.teamMemberOrder?.includes(m._id!)
				),
			]
		: teamMembers;

	if (isLoading) {
		return (
			<div className="flex flex-col">
				<div className="container py-20">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-64 bg-muted rounded" />
						<div className="h-4 w-96 bg-muted rounded" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !project) {
		return (
			<div className="flex flex-col">
				<div className="container py-20 text-center">
					<h1 className="text-2xl font-bold mb-4">{m.projects_notFound()}</h1>
					<p className="text-muted-foreground mb-8">
						{m.projects_notFoundDescription()}
					</p>
					<Button asChild>
						<Link to={localizeHref("/projects")}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{m.projects_backToProjects()}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<PageHero
				headline={project.name}
				subheadline={project.shortDescription}
			/>

			<section className="container pb-12">
				<Button variant="ghost" size="sm" asChild className="mb-8">
					<Link to={localizeHref("/projects")}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{m.projects_backToProjects()}
					</Link>
				</Button>

				{/* Project Logo */}
				{project.logo && (
					<div className="mb-12">
						<img
							src={getMediaUrl(project.logo)}
							alt={`${project.name} logo`}
							className="h-20 max-w-[280px] object-contain"
						/>
					</div>
				)}

				{/* External Links */}
				{(project.githubUrl || project.docsUrl || project.websiteUrl) && (
					<div className="flex flex-wrap gap-4 mb-12">
						{project.githubUrl && (
							<Button variant="outline" asChild>
								<a
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github className="mr-2 h-4 w-4" />
									{m.projects_viewGithub()}
								</a>
							</Button>
						)}
						{project.docsUrl && (
							<Button variant="outline" asChild>
								<a
									href={project.docsUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<BookOpen className="mr-2 h-4 w-4" />
									{m.projects_viewDocs()}
								</a>
							</Button>
						)}
						{project.websiteUrl && (
							<Button variant="outline" asChild>
								<a
									href={project.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Globe className="mr-2 h-4 w-4" />
									{m.projects_visitWebsite()}
								</a>
							</Button>
						)}
					</div>
				)}

				{/* Long Description */}
				<div className="prose prose-lg dark:prose-invert max-w-none">
					<div dangerouslySetInnerHTML={{ __html: project.longDescription }} />
				</div>

				{/* Team Members */}
				{sortedTeamMembers.length > 0 && (
					<div className="mt-16">
						<h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
							<Users className="h-6 w-6" />
							{m.projects_team()}
						</h2>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{sortedTeamMembers.map((member) => {
								const fullName = [member.firstName, member.lastName]
									.filter(Boolean)
									.join(" ");
								// Prefer project-specific title, fall back to general roles
								const projectTitle = getProjectDisplayTitle(
									member,
									slug,
									locale
								);
								const roles = getMemberRoles(member, locale);
								const displayTitle = projectTitle || roles.join(", ");

								return (
									<div
										key={member._id}
										className="flex items-center gap-4 p-4 rounded-lg border bg-card"
									>
										{member.picture ? (
											<img
												src={getMediaUrl(member.picture)}
												alt={fullName}
												className="h-16 w-16 rounded-full object-cover"
											/>
										) : (
											<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
												<Users className="h-8 w-8 text-muted-foreground" />
											</div>
										)}
										<div>
											<p className="font-semibold">{fullName}</p>
											{displayTitle && (
												<p className="text-sm text-muted-foreground">
													{displayTitle}
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</section>
		</div>
	);
}



