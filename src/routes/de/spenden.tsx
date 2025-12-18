import { createFileRoute } from "@tanstack/react-router";
import { DonatePageContent } from "../donate";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/de/spenden")({
	head: () => ({
		meta: [
			{
				title: m.donate_metadata_title(),
			},
			{
				name: "description",
				content: m.donate_metadata_description(),
			},
		],
	}),
	component: DonatePageContent,
});
