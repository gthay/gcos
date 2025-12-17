/**
 * Client-side wrapper for media server functions
 * This ensures server functions are only imported at runtime
 */

export async function getMediaFiles() {
	// Dynamic import to avoid bundling server code
	const { getFiles } = await import("@/lib/server/media");
	return getFiles();
}
