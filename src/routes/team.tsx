import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/layout/PageHero";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamPageData } from "@/lib/server/team-members";
import { getProjects } from "@/lib/server/projects";
import * as m from "@/paraglide/messages";
import { Github, Linkedin, Globe, Users } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";
import {
	getCouncilDisplayTitle,
	getConsultantDisplayTitle,
	getCourseInstructorDisplayTitle,
	getProjectDisplayTitle,
} from "@/lib/schemas/team-member";
import type { TeamMember } from "@/lib/schemas/team-member";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/team")({
	head: () => ({
		meta: [
			{
				title: m.team_metadata_title(),
			},
			{
				name: "description",
				content: m.team_metadata_description(),
			},
		],
	}),
	component: TeamPage,
});

// Team member card component
function TeamMemberCard({
	member,
	roleTitle,
}: {
	member: TeamMember;
	roleTitle: string;
}) {
	const fullName = [member.firstName, member.lastName]
		.filter(Boolean)
		.join(" ");

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-6">
				<div className="flex flex-col items-center text-center">
					{/* Profile Picture */}
					{member.picture ? (
						<img
							src={getMediaUrl(member.picture)}
							alt={fullName}
							className="h-24 w-24 rounded-full object-cover mb-4"
						/>
					) : (
						<div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
							<Users className="h-12 w-12 text-muted-foreground" />
						</div>
					)}

					{/* Name */}
					<h3 className="text-lg font-semibold">{fullName}</h3>

					{/* Role Title */}
					{roleTitle && (
						<p className="text-sm text-muted-foreground mt-1">{roleTitle}</p>
					)}

					{/* Social Links */}
					{(member.githubUrl || member.linkedinUrl || member.websiteUrl) && (
						<div className="flex gap-3 mt-4">
							{member.githubUrl && (
								<a
									href={member.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
									aria-label={`${fullName} on GitHub`}
								>
									<Github className="h-5 w-5" />
								</a>
							)}
							{member.linkedinUrl && (
								<a
									href={member.linkedinUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
									aria-label={`${fullName} on LinkedIn`}
								>
									<Linkedin className="h-5 w-5" />
								</a>
							)}
							{member.websiteUrl && (
								<a
									href={member.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
									aria-label={`${fullName}'s website`}
								>
									<Globe className="h-5 w-5" />
								</a>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function TeamPage() {
	const locale = useLocale();

	const { data: teamData, isLoading: isLoadingTeam } = useQuery({
		queryKey: ["teamPageData"],
		queryFn: () => getTeamPageData(),
	});

	// Fetch projects to get display names
	const { data: projects = [] } = useQuery({
		queryKey: ["projects"],
		queryFn: () => getProjects(),
	});

	if (isLoadingTeam) {
		return (
			<div className="flex flex-col">
				<PageHero
					headline={m.team_hero_headline()}
					subheadline={m.team_hero_subheadline()}
				/>
				<div className="container py-16">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-48 bg-muted rounded" />
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="h-64 bg-muted rounded-lg" />
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	const {
		councilMembers = [],
		consultants = [],
		courseInstructors = [],
		uniqueProjects = [],
		allMembers = [],
	} = teamData || {};

	// Helper to get project display name
	const getProjectName = (slug: string): string => {
		const project = projects.find((p) => p.slug === slug);
		return project?.name || slug;
	};

	// Helper to get members for a specific project
	const getProjectMembers = (projectSlug: string): TeamMember[] => {
		return allMembers.filter((m) => m.projects?.includes(projectSlug));
	};

	// Check if we have any content after course instructors
	const hasProjectSections = uniqueProjects.some(
		(slug) => getProjectMembers(slug).length > 0
	);

	return (
		<div className="flex flex-col">
			<PageHero
				headline={m.team_hero_headline()}
				subheadline={m.team_hero_subheadline()}
			/>

			{/* Council Members */}
			{councilMembers.length > 0 && (
				<>
					<section className="container py-16">
						<div className="mb-8">
							<h2 className="text-3xl font-bold tracking-tight">
								{m.team_council_title()}
							</h2>
							<p className="text-muted-foreground mt-2">
								{m.team_council_description()}
							</p>
						</div>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{councilMembers.map((member) => (
								<TeamMemberCard
									key={member._id}
									member={member}
									roleTitle={getCouncilDisplayTitle(member, locale)}
								/>
							))}
						</div>
					</section>
					<Separator />
				</>
			)}

			{/* Consultants */}
			{consultants.length > 0 && (
				<>
					<section className="container py-16">
						<div className="mb-8">
							<h2 className="text-3xl font-bold tracking-tight">
								{m.team_consultants_title()}
							</h2>
							<p className="text-muted-foreground mt-2">
								{m.team_consultants_description()}
							</p>
						</div>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{consultants.map((member) => (
								<TeamMemberCard
									key={member._id}
									member={member}
									roleTitle={getConsultantDisplayTitle(member, locale)}
								/>
							))}
						</div>
					</section>
					<Separator />
				</>
			)}

			{/* Course Instructors */}
			{courseInstructors.length > 0 && (
				<>
					<section className="container py-16">
						<div className="mb-8">
							<h2 className="text-3xl font-bold tracking-tight">
								{m.team_instructors_title()}
							</h2>
							<p className="text-muted-foreground mt-2">
								{m.team_instructors_description()}
							</p>
						</div>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{courseInstructors.map((member) => (
								<TeamMemberCard
									key={member._id}
									member={member}
									roleTitle={getCourseInstructorDisplayTitle(member, locale)}
								/>
							))}
						</div>
					</section>
					{hasProjectSections && <Separator />}
				</>
			)}

			{/* Project Teams */}
			{uniqueProjects.map((projectSlug, index) => {
				const projectMembers = getProjectMembers(projectSlug);
				if (projectMembers.length === 0) return null;

				const projectName = getProjectName(projectSlug);
				const isLastProject =
					index ===
					uniqueProjects.filter((s) => getProjectMembers(s).length > 0).length -
						1;

				return (
					<div key={projectSlug}>
						<section className="container py-16">
							<div className="mb-8">
								<h2 className="text-3xl font-bold tracking-tight">
									{projectName} {m.team_project_team()}
								</h2>
								<p className="text-muted-foreground mt-2">
									{m.team_project_contributors()}
								</p>
							</div>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
								{projectMembers.map((member) => (
									<TeamMemberCard
										key={`${projectSlug}-${member._id}`}
										member={member}
										roleTitle={getProjectDisplayTitle(
											member,
											projectSlug,
											locale
										)}
									/>
								))}
							</div>
						</section>
						{!isLastProject && <Separator />}
					</div>
				);
			})}
		</div>
	);
}

