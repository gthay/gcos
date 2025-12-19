import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { getPublicPage } from "@/lib/server/pages";
import { PageHero } from "@/components/layout/PageHero";
import type { Locale } from "@/lib/i18n/locale";

// Translations for both locales
const translations = {
	en: {
		title: "Privacy Policy - GC.OS",
		headline: "Privacy Policy",
		noContent: "The privacy policy content is currently being prepared.",
	},
	de: {
		title: "Datenschutzerklärung - GC.OS",
		headline: "Datenschutzerklärung",
		noContent: "Die Datenschutzerklärung wird derzeit vorbereitet.",
	},
};

// Server function to fetch page content - reads locale from Paraglide cookie
const fetchPrivacyPolicyWithLocale = createServerFn({ method: "GET" }).handler(async () => {
	const cookieLocale = getCookie("PARAGLIDE_LOCALE");
	const locale: Locale = cookieLocale === "de" ? "de" : "en";
	const page = await getPublicPage({ data: { id: "privacy-policy", locale } });
	return { page, locale };
});

export const Route = createFileRoute("/privacy-policy")({
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.locale === "de" ? translations.de.title : translations.en.title,
			},
		],
	}),
	loader: () => fetchPrivacyPolicyWithLocale(),
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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



