import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import * as paraglideRuntime from '@/paraglide/runtime.js'
import type { Locale } from '@/lib/i18n/locale'

export function LanguageSwitcher({ locale }: { locale: Locale }) {
	// Use the locale prop (from loader) to avoid hydration mismatch
	const currentLocale = locale

	const handleLocaleChange = (newLocale: string) => {
		// setLocale with reload: true will:
		// 1. Update the cookie
		// 2. Compute the localized URL based on URL patterns
		// 3. Navigate to the localized URL
		paraglideRuntime.setLocale(newLocale as 'en' | 'de', { reload: true })
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
				{paraglideRuntime.locales.map((locale) => (
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

