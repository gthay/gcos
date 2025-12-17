import { createFileRoute } from "@tanstack/react-router";
import { ProjectDetailPageContent } from "../../projects/$slug";

export const Route = createFileRoute("/de/projekte/$slug")({
	component: ProjectDetailPageContent,
});
