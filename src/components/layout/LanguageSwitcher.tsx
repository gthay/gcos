import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { getLocale, setLocale, locales, localizeHref } from '@/paraglide/runtime.js'

export function LanguageSwitcher() {
	const currentLocale = getLocale()

	const handleLocaleChange = (newLocale: string) => {
		// Get the current pathname and localize it
		const currentPath = window.location.pathname
		const localizedPath = localizeHref(currentPath, { locale: newLocale as 'en' | 'de' })
		
		// Set the locale (updates cookie) without reloading
		setLocale(newLocale as 'en' | 'de', { reload: false })
		
		// Navigate to the localized URL - this will trigger a page reload
		// with the correct locale from the URL
		window.location.href = localizedPath
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
				{locales.map((locale) => (
					<DropdownMenuItem
						key={locale}
						disabled={locale === currentLocale}
						onClick={() => handleLocaleChange(locale)}
					>
						{locale === 'en' ? 'English' : 'Deutsch'}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

