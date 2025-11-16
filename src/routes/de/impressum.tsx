import { createFileRoute } from "@tanstack/react-router";
import { ImprintPage } from "../imprint";

export const Route = createFileRoute("/de/impressum")({
	component: ImprintPage,
});
