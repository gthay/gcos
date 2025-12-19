import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/layout/PageHero";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/lib/server/projects";
import { localizeHref } from "@/paraglide/runtime.js";
import * as m from "@/paraglide/messages";
import { Github, BookOpen, Globe } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";

export const Route = createFileRoute("/projects/")({
	head: () => ({
		meta: [
			{
				title: m.projects_metadata_title(),
			},
			{
				name: "description",
				content: m.projects_metadata_description(),
			},
		],
	}),
	component: ProjectsPageContent,
});

export function ProjectsPageContent() {
	const { data: projects = [], isLoading } = useQuery({
		queryKey: ["public-projects"],
		queryFn: () => getProjects(),
	});

	return (
		<div className="flex flex-col">
			<PageHero
				headline={m.projects_hero_headline()}
				subheadline={m.projects_hero_subheadline()}
			/>

			<section className="container pb-20 md:pb-28">
				{isLoading ? (
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-16 w-32 bg-muted rounded-lg" />
									<div className="h-6 w-32 bg-muted rounded mt-4" />
								</CardHeader>
								<CardContent>
									<div className="h-4 w-full bg-muted rounded" />
									<div className="h-4 w-3/4 bg-muted rounded mt-2" />
								</CardContent>
							</Card>
						))}
					</div>
				) : projects.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							{m.projects_empty()}
						</p>
					</div>
				) : (
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{projects.map((project) => (
							<Card
								key={project._id}
								className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-shadow"
							>
								<CardHeader>
									<div className="h-20 flex items-center">
										{project.logo ? (
											<div className="bg-white rounded-lg p-3 h-full flex items-center">
												<img
													src={getMediaUrl(project.logo)}
													alt={`${project.name} logo`}
													className="h-full max-w-[180px] object-contain"
												/>
											</div>
										) : (
											<div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
												<span className="text-2xl font-bold text-primary">
													{project.name.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
									</div>
									<CardTitle className="text-xl mt-4">{project.name}</CardTitle>
									<CardDescription className="text-base line-clamp-3">
										{project.shortDescription}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-1 flex-col justify-end">
									<div className="flex flex-wrap gap-2 mb-4">
										{project.githubUrl && (
											<Button variant="outline" size="sm" asChild>
												<a
													href={project.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Github className="h-4 w-4 mr-1" />
													GitHub
												</a>
											</Button>
										)}
										{project.docsUrl && (
											<Button variant="outline" size="sm" asChild>
												<a
													href={project.docsUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													<BookOpen className="h-4 w-4 mr-1" />
													{m.projects_docs()}
												</a>
											</Button>
										)}
										{project.websiteUrl && (
											<Button variant="outline" size="sm" asChild>
												<a
													href={project.websiteUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Globe className="h-4 w-4 mr-1" />
													Website
												</a>
											</Button>
										)}
									</div>
									<Button variant="outline" className="w-full" asChild>
										<Link to={localizeHref(`/projects/${project.slug}`)}>
											{m.projects_viewProject()}
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</section>
		</div>
	);
}


