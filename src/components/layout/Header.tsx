import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
		menu: "Menu",
	},
	de: {
		home: "Startseite",
		about: "Über uns",
		team: "Team",
		courses: "Kurse", // TODO: Re-enable when courses page is ready
		projects: "Projekte",
		contact: "Kontakt",
		donate: "Spenden",
		menu: "Menü",
	},
};

export function Header({ locale }: { locale: Locale }) {
	const nav = translations[locale];
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navLinks = [
		{ to: "/", label: nav.home },
		{ to: "/about", label: nav.about },
		{ to: "/team", label: nav.team },
		{ to: "/projects", label: nav.projects },
		{ to: "/contact", label: nav.contact },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between">
				{/* Logo */}
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

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center space-x-6">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Right side actions */}
				<div className="flex items-center gap-2 md:gap-4">
					{/* Donate CTA - hidden on very small screens */}
					<Button size="sm" className="hidden sm:inline-flex text-base" asChild>
						<Link to="/donate">{nav.donate}</Link>
					</Button>
					<LanguageSwitcher locale={locale} />
					<ThemeToggle />

					{/* Mobile Menu - positioned at the far right */}
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger asChild className="md:hidden">
							<Button variant="ghost" size="icon" aria-label={nav.menu}>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] px-6">
							<SheetHeader className="pb-2">
								<SheetTitle>
									<img
										src="/logos/GCOS-Header-Logo.svg"
										alt="GC.OS Logo"
										width={100}
										height={32}
										className="h-7 w-auto dark:hidden"
									/>
									<img
										src="/logos/GCOS-Header-Logo-Negative.svg"
										alt="GC.OS Logo"
										width={100}
										height={32}
										className="hidden h-7 w-auto dark:block"
									/>
								</SheetTitle>
							</SheetHeader>
							<Separator className="my-4" />
							<nav className="flex flex-col space-y-1">
								{navLinks.map((link) => (
									<Link
										key={link.to}
										to={link.to}
										className="py-3 px-2 -mx-2 rounded-md text-lg font-medium transition-colors hover:bg-muted hover:text-foreground text-foreground/70"
										onClick={() => setMobileMenuOpen(false)}
									>
										{link.label}
									</Link>
								))}
							</nav>
							<Separator className="my-4" />
							<Button className="w-full" size="lg" asChild>
								<Link
									to="/donate"
									onClick={() => setMobileMenuOpen(false)}
								>
									<Heart className="mr-2 h-4 w-4" />
									{nav.donate}
								</Link>
							</Button>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}

