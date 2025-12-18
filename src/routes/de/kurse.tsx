import { createFileRoute } from "@tanstack/react-router";
import { CoursesPageContent } from "../courses";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/de/kurse")({
	head: () => ({
		meta: [
			{
				title: m.courses_metadata_title(),
			},
			{
				name: "description",
				content: m.courses_metadata_description(),
			},
		],
	}),
	component: CoursesPageContent,
});








