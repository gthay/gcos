import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { getProjectBySlug } from "@/lib/server/projects";
import { localizeHref } from "@/paraglide/runtime.js";
import * as m from "@/paraglide/messages";
import { Github, BookOpen, Globe, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/projects/$slug")({
	component: ProjectDetailPageContent,
});

export function ProjectDetailPageContent() {
	const { slug } = useParams({ from: "/projects/$slug" });

	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-project", slug],
		queryFn: () => getProjectBySlug({ data: slug }),
	});

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
			</section>
		</div>
	);
}
