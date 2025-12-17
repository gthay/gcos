import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { PageHero } from "@/components/layout/PageHero";
import { getPublicPage } from "@/lib/server/pages";
import type { Locale } from "@/lib/i18n/locale";

// Translations for both locales
const translations = {
	en: {
		title: "Imprint - GC.OS",
		headline: "Legal Notice",
		noContent: "The imprint content is currently being prepared.",
	},
	de: {
		title: "Impressum - GC.OS",
		headline: "Impressum",
		noContent: "Der Impressumsinhalt wird derzeit vorbereitet.",
	},
};

// Server function to fetch page content - reads locale from Paraglide cookie
const fetchImprintWithLocale = createServerFn({ method: "GET" }).handler(async () => {
	const cookieLocale = getCookie("PARAGLIDE_LOCALE");
	const locale: Locale = cookieLocale === "de" ? "de" : "en";
	const page = await getPublicPage({ data: { id: "imprint", locale } });
	return { page, locale };
});

export const Route = createFileRoute("/imprint")({
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.locale === "de" ? translations.de.title : translations.en.title,
			},
		],
	}),
	// Server function reads locale from Paraglide cookie
	loader: () => fetchImprintWithLocale(),
	component: ImprintPage,
});

function ImprintPage() {
	// Content already selected for the correct locale by the loader
	const { page, locale } = Route.useLoaderData();
	const t = translations[locale as Locale];

	if (!page || !page.content) {
		return (
			<div className="flex flex-col">
				<PageHero headline={t.headline} />
				<section className="container py-12 md:py-16">
					<div className="mx-auto max-w-3xl text-center">
						<p className="text-muted-foreground">{t.noContent}</p>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<PageHero headline={page.title || t.headline} />
			<section className="container py-12 md:py-16">
				<article className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
					<div dangerouslySetInnerHTML={{ __html: page.content }} />
				</article>
			</section>
		</div>
	);
}
