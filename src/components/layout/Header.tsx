import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import * as m from '@/paraglide/messages'

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between">
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
						{m.nav_home()}
					</Link>
					<Link
						to="/about"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{m.nav_about()}
					</Link>
					<a
						href="#"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{m.nav_projects()}
					</a>
					<a
						href="#"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{m.nav_services()}
					</a>
					<a
						href="#"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{m['nav_getInvolved']()}
					</a>
					<Link
						to="/contact"
						className="text-base font-normal transition-colors hover:text-foreground/80 text-foreground/60"
					>
						{m.nav_contact()}
					</Link>
				</nav>
				<div className="flex items-center gap-4">
					<Button size="sm" className="text-base" asChild>
						<a href="#">{m.cta_donate()}</a>
					</Button>
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</header>
	)
}

