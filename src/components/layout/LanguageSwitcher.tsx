import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { getLocale, localizeHref, deLocalizeHref } from '@/paraglide/runtime.js'

export function LanguageSwitcher() {
	const locale = getLocale()
	const location = useLocation()

	// Get the pathname without locale prefix
	const pathWithoutLocale = deLocalizeHref(location.pathname)

	// Get localized path for a target locale
	const getLocalizedPath = (targetLocale: 'en' | 'de') => {
		return localizeHref(pathWithoutLocale, { locale: targetLocale })
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9">
					<Globe className="h-4 w-4" />
					<span className="sr-only">Switch language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild disabled={locale === 'en'}>
					<Link to={getLocalizedPath('en')} className="w-full">
						English
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild disabled={locale === 'de'}>
					<Link to={getLocalizedPath('de')} className="w-full">
						Deutsch
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

