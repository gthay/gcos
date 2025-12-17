import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	Link,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ScrollToTop } from "../components/layout/ScrollToTop";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { LocaleProvider } from "@/lib/locale-context";
import type { Locale } from "@/lib/i18n/locale";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

// Server function to get locale from Paraglide cookie
const getLocaleFromCookie = createServerFn({ method: "GET" }).handler(async () => {
	const cookieLocale = getCookie("PARAGLIDE_LOCALE");
	const locale: Locale = cookieLocale === "de" ? "de" : "en";
	return { locale };
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "GC.OS - German Center of Open Source AI",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/icons/favicon/icon1.png",
				sizes: "96x96",
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/icons/favicon/icon0.svg",
			},
			{
				rel: "shortcut icon",
				href: "/icons/favicon/favicon.ico",
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/icons/favicon/apple-icon.png",
			},
			{
				rel: "manifest",
				href: "/icons/favicon/manifest.json",
			},
		],
	}),
	// Get locale from Paraglide cookie
	loader: () => getLocaleFromCookie(),
	component: RootComponent,
	notFoundComponent: NotFoundFallback,
});

function RootComponent() {
	const { locale } = Route.useLoaderData();
	const { location } = useRouterState();
	// Admin routes don't have locale prefixes, so pathname is consistent
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				<LocaleProvider locale={locale}>
					<ScrollToTop />
					{!isAdminRoute && <Header locale={locale} />}
					{isAdminRoute ? (
						<Outlet />
					) : (
						<PageTransition>
							<Outlet />
						</PageTransition>
					)}
					{!isAdminRoute && <Footer locale={locale} />}
				</LocaleProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFoundFallback() {
	const { locale } = Route.useLoaderData();
	const t =
		locale === "de"
			? {
					title: "Seite nicht gefunden",
					description:
						"Die angeforderte Seite existiert nicht oder wurde verschoben. Bitte prüfe die URL oder nutze die folgenden Links, um weiterzumachen.",
					home: "Zur Startseite",
					contact: "Kontakt aufnehmen",
				}
			: {
					title: "Page not found",
					description:
						"The requested page does not exist or has been moved. Please check the URL or use the following links to continue.",
					home: "Go to Home",
					contact: "Contact us",
				};

	return (
		<div className="flex flex-col items-center gap-4 py-24 text-center">
			<div>
				<p className="text-sm uppercase tracking-widest text-primary">404</p>
				<h1 className="text-3xl font-bold">{t.title}</h1>
			</div>
			<p className="max-w-xl text-balance text-muted-foreground">
				{t.description}
			</p>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button asChild>
					<Link to="/">{t.home}</Link>
				</Button>
				<Link
					to="/contact"
					className="text-sm font-medium text-primary underline"
				>
					{t.contact}
				</Link>
			</div>
		</div>
	);
}
