import { Link } from "@tanstack/react-router";
import type { Locale } from "@/lib/i18n/locale";
import { Github, Linkedin } from "lucide-react";
import { SiDiscord, SiHuggingface } from "react-icons/si";

// Translations for footer
const translations = {
	en: {
		sitemap: "Sitemap",
		about: "About",
		projects: "Projects",
		donate: "Donate",
		contact: "Contact",
		contactUs: "Contact Us",
		legal: "Legal",
		imprint: "Imprint",
		privacy: "Privacy Policy",
		nonProfit: "Non-profit organization",
	},
	de: {
		sitemap: "Sitemap",
		about: "Über uns",
		projects: "Projekte",
		donate: "Spenden",
		contact: "Kontakt",
		contactUs: "Kontaktieren Sie uns",
		legal: "Rechtliches",
		imprint: "Impressum",
		privacy: "Datenschutz",
		nonProfit: "Gemeinnütziger Verein",
	},
};

export function Footer({ locale }: { locale: Locale }) {
	const t = translations[locale];

	return (
		<footer className="border-t bg-background">
			<div className="container py-12 md:py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="space-y-4">
						{/* Router automatically localizes URLs via rewrite.output */}
						<Link to="/" className="flex items-center space-x-2">
							<img
								src="/logos/GCOS-Header-Logo.svg"
								alt="GC.OS Logo"
								width={120}
								height={40}
								className="h-6 w-auto dark:hidden"
							/>
							<img
								src="/logos/GCOS-Header-Logo-Negative.svg"
								alt="GC.OS Logo"
								width={120}
								height={40}
								className="hidden h-6 w-auto dark:block"
							/>
						</Link>
						<p className="text-sm text-muted-foreground">
							German Center of Open Source AI
						</p>
						<div className="flex items-center gap-3">
							<a
								href="https://github.com/gc-os-ai/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="GitHub"
							>
								<Github className="h-5 w-5" />
							</a>
							<a
								href="https://huggingface.co/gcos"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Hugging Face"
							>
								<SiHuggingface className="h-5 w-5" />
							</a>
							<a
								href="https://discord.gg/7uKdHfdcJG"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Discord"
							>
								<SiDiscord className="h-5 w-5" />
							</a>
							<a
								href="https://www.linkedin.com/company/german-center-for-open-source-ai/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="LinkedIn"
							>
								<Linkedin className="h-5 w-5" />
							</a>
						</div>
					</div>

					<div className="space-y-4">
						<h4 className="text-sm font-semibold">{t.sitemap}</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/about"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t.about}
								</Link>
							</li>
							<li>
								<Link
									to="/projects"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t.projects}
								</Link>
							</li>
							<li>
								<Link
									to="/donate"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t.donate}
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h4 className="text-sm font-semibold">{t.contact}</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									to="/contact"
									className="hover:text-foreground transition-colors"
								>
									{t.contactUs}
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h4 className="text-sm font-semibold">{t.legal}</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									to="/imprint"
									className="hover:text-foreground transition-colors"
								>
									{t.imprint}
								</Link>
							</li>
							<li>
								<Link
									to="/privacy-policy"
									className="hover:text-foreground transition-colors"
								>
									{t.privacy}
								</Link>
							</li>
							<li className="text-xs">{t.nonProfit}</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
					<p>© {new Date().getFullYear()} GC.OS. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
