import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/locale";

// Context for SSR-safe locale access
const LocaleContext = createContext<Locale>("en");

/**
 * Provider that passes locale from loader to all components
 * The locale MUST come from the loader (which reads from request header)
 * to ensure SSR and client render the same value
 */
export function LocaleProvider({
	children,
	locale,
}: { children: ReactNode; locale: Locale }) {
	return (
		<LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
	);
}

/**
 * Hook to get the current locale
 * This returns the locale from the loader, ensuring SSR/client consistency
 */
export function useLocale(): Locale {
	return useContext(LocaleContext);
}

/**
 * SSR-safe version of localizeHref that uses the loader locale
 */
export function useLocalizeHref() {
	const locale = useLocale();

	return (href: string) => {
		return withLocale(locale, href);
	};
}



