import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n/locale";

// Translations for navigation
const translations = {
	en: {
		home: "Home",
		about: "About",
		team: "Team",
		courses: "Courses", // TODO: Re-enable when courses page is ready
		projects: "Projects",
		contact: "Contact",
		donate: "Donate",
	},
	de: {
		home: "Startseite",
		about: "Über uns",
		team: "Team",
		courses: "Kurse", // TODO: Re-enable when courses page is ready
		projects: "Projekte",
		contact: "Kontakt",
		donate: "Spenden",
	},
};

export function Header({ locale }: { locale: Locale }) {
	const nav = translations[locale];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between">
				{/* Router automatically localizes URLs via rewrite.output */}
				<Link to="/" className="flex items-center space-x-2">
					<img
						src="/logos/GCOS-Header-Logo.svg"
						alt="GC.OS Logo"
						width={120}
						height={40}
						className="h-8 w-auto dark:hidden"
					/>
					<img
						src="/logos/GCOS-Header-Logo-Negative.svg"
						alt="GC.OS Logo"
						width={120}
						height={40}
						className="hidden h-8 w-auto dark:block"
					/>
				</Link>
				<nav className="hidden md:flex items-center space-x-6">
					<Link
						to="/"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{nav.home}
					</Link>
					<Link
						to="/about"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{nav.about}
					</Link>
					<Link
						to="/team"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{nav.team}
					</Link>
					{/* TODO: Re-enable when courses page is ready
					<Link
						to="/courses"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{nav.courses}
					</Link>
					*/}
					<Link
						to="/projects"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{nav.projects}
					</Link>
					<Link
						to="/contact"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{nav.contact}
					</Link>
				</nav>
				<div className="flex items-center gap-4">
					<Button size="sm" className="text-base" asChild>
						<Link to="/donate">{nav.donate}</Link>
					</Button>
					<LanguageSwitcher locale={locale} />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}

