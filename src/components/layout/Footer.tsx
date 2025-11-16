import { Link } from "@tanstack/react-router";
import { localizeHref } from "@/paraglide/runtime.js";
import * as m from "@/paraglide/messages";

export function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container py-12 md:py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="space-y-4">
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
					</div>

					<div className="space-y-4">
						<h4 className="text-sm font-semibold">{m.footer_sitemap()}</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									About
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Projects
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Services
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Get Involved
								</a>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h4 className="text-sm font-semibold">{m.footer_contact()}</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									to="/contact"
									className="hover:text-foreground transition-colors"
								>
									Contact Us
								</Link>
							</li>
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									{m.footer_newsletter()}
								</a>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h4 className="text-sm font-semibold">{m.footer_legal()}</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									to={localizeHref("/imprint")}
									className="hover:text-foreground transition-colors"
								>
									{m.footer_impressum()}
								</Link>
							</li>
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									{m.footer_privacy()}
								</a>
							</li>
							<li className="text-xs">{m.footer_nonProfit()}</li>
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
