import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { getLocale, setLocale, locales } from '@/paraglide/runtime.js'

export function LanguageSwitcher() {
	const currentLocale = getLocale()

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
						onClick={() => setLocale(locale)}
					>
						{locale === 'en' ? 'English' : 'Deutsch'}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

