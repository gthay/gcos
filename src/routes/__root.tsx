import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
	Link,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import Header from "../components/Header";
import { Footer } from "../components/layout/Footer";
import { ScrollToTop } from "../components/layout/ScrollToTop";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "@/components/ui/button";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { getLocale } from "../paraglide/runtime.js";

interface MyRouterContext {
	queryClient: QueryClient;
}

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
				title: "TanStack Start Starter",
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
	notFoundComponent: NotFoundFallback,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { location } = useRouterState();
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<html lang={getLocale()}>
			<head>
				<HeadContent />
			</head>
			<body>
				<ScrollToTop />
				{!isAdminRoute && <Header />}
				{isAdminRoute ? (
					children
				) : (
					<PageTransition>{children}</PageTransition>
				)}
				{!isAdminRoute && <Footer />}
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
	return (
		<div className="flex flex-col items-center gap-4 py-24 text-center">
			<div>
				<p className="text-sm uppercase tracking-widest text-primary">404</p>
				<h1 className="text-3xl font-bold">Seite nicht gefunden</h1>
			</div>
			<p className="max-w-xl text-balance text-muted-foreground">
				Die angeforderte Seite existiert nicht oder wurde verschoben. Bitte prüfe
				die URL oder nutze die folgenden Links, um weiterzumachen.
			</p>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button asChild>
					<Link to="/">Zur Startseite</Link>
				</Button>
				<Link to="/contact" className="text-sm font-medium text-primary underline">
					Kontakt aufnehmen
				</Link>
			</div>
		</div>
	);
}
