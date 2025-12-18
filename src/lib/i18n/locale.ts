export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Extract locale from URL pathname
 * /de/... => "de", everything else => "en"
 */
export function getLocaleFromPathname(pathname: string): Locale {
	const seg = pathname.split("/").filter(Boolean)[0];
	if (seg === "de") return "de";
	return "en";
}

/**
 * Strip locale prefix from pathname
 * /de/about => /about
 */
export function stripLocalePrefix(pathname: string): string {
	const parts = pathname.split("/").filter(Boolean);
	if (parts[0] === "de" || parts[0] === "en") parts.shift();
	return "/" + parts.join("/");
}

/**
 * Add locale prefix to path
 * withLocale("de", "/about") => "/de/about"
 * withLocale("en", "/about") => "/about"
 */
export function withLocale(locale: Locale, path: string): string {
	const clean = path.startsWith("/") ? path : `/${path}`;
	return locale === "en" ? clean : `/${locale}${clean === "/" ? "" : clean}`;
}


