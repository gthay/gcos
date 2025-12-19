/**
 * Media URL utilities
 *
 * These functions handle the conversion between media keys (stored in DB)
 * and full URLs (used in the frontend).
 *
 * Design principle: Store only the key (filename) in the database,
 * generate URLs at runtime for easy domain migrations.
 */

/**
 * Extract the media key from various URL formats.
 * Handles:
 * - Full URLs: https://example.com/api/media/image.webp → image.webp
 * - Localhost URLs: http://localhost:3000/api/media/image.webp → image.webp
 * - Relative URLs: /api/media/image.webp → image.webp
 * - Plain keys: image.webp → image.webp
 */
export function extractMediaKey(urlOrKey: string | undefined | null): string {
	if (!urlOrKey) return "";

	let key = urlOrKey;

	// Remove /api/media/ prefix if present (handles both absolute and relative URLs)
	key = key.replace(/^.*\/api\/media\//, "");

	// If it's still a full URL (e.g., direct S3 URL), extract the pathname
	if (key.startsWith("http://") || key.startsWith("https://")) {
		try {
			const urlObj = new URL(key);
			key = urlObj.pathname.replace(/^\//, "");
		} catch {
			// If parsing fails, try to extract just the filename
			const match = key.match(/([^/]+)$/);
			key = match ? match[1] : key;
		}
	}

	// Remove any leading slashes
	key = key.replace(/^\/+/, "");

	return key;
}

/**
 * Convert a media key (or legacy URL) to a usable image src URL.
 * Uses the /api/media/ proxy which works in all environments.
 *
 * @param keyOrUrl - The media key or legacy full URL
 * @returns A relative URL like /api/media/image.webp
 */
export function getMediaUrl(keyOrUrl: string | undefined | null): string {
	const key = extractMediaKey(keyOrUrl);
	if (!key) return "";

	return `/api/media/${key}`;
}


