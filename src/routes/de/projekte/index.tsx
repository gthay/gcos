import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPageContent } from "../../projects/index";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/de/projekte/")({
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


