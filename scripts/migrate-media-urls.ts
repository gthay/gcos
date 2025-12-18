/**
 * Migration script to convert full media URLs to keys
 *
 * This script updates all media URL references in the database to store
 * only the file key instead of the full URL. This makes domain migrations
 * easier and follows the new architecture.
 *
 * Usage: pnpm tsx scripts/migrate-media-urls.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be changed without making actual changes
 */

// Load environment variables from .env file
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", ".env");

try {
	const envFile = readFileSync(envPath, "utf-8");
	envFile.split("\n").forEach((line) => {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith("#")) {
			const [key, ...valueParts] = trimmed.split("=");
			if (key && valueParts.length > 0) {
				const value = valueParts.join("=").trim();
				// Remove quotes if present
				const cleanValue = value.replace(/^["']|["']$/g, "");
				process.env[key.trim()] = cleanValue;
			}
		}
	});
} catch (error) {
	console.warn("Warning: Could not load .env file:", error);
}

import { getDb } from "../src/lib/db";
import type { Db } from "mongodb";

/**
 * Extract the media key from various URL formats.
 * Handles:
 * - Full URLs: https://example.com/api/media/image.webp → image.webp
 * - Localhost URLs: http://localhost:3000/api/media/image.webp → image.webp
 * - Relative URLs: /api/media/image.webp → image.webp
 * - Plain keys: image.webp → image.webp (no change)
 */
function extractMediaKey(urlOrKey: string): string {
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
 * Check if a value is a full URL that needs migration
 */
function needsMigration(value: string): boolean {
	if (!value) return false;
	// If it contains /api/media/ or starts with http, it needs migration
	return value.includes("/api/media/") || value.startsWith("http://") || value.startsWith("https://");
}

interface MigrationResult {
	collection: string;
	documentId: string;
	field: string;
	oldValue: string;
	newValue: string;
}

async function migrateCollection(
	db: Db,
	collectionName: string,
	field: string,
	dryRun: boolean
): Promise<MigrationResult[]> {
	const collection = db.collection(collectionName);
	const results: MigrationResult[] = [];

	// Find all documents where the field exists and is not empty
	const filter = {
		[field]: { $exists: true, $ne: "", $ne: null },
	};

	const documents = await collection.find(filter).toArray();

	for (const doc of documents) {
		const oldValue = doc[field] as string;

		if (!needsMigration(oldValue)) {
			continue;
		}

		const newValue = extractMediaKey(oldValue);

		if (oldValue !== newValue) {
			results.push({
				collection: collectionName,
				documentId: doc._id.toString(),
				field,
				oldValue,
				newValue,
			});

			if (!dryRun) {
				await collection.updateOne(
					{ _id: doc._id },
					{ $set: { [field]: newValue } }
				);
			}
		}
	}

	return results;
}

async function migrateHostsField(
	db: Db,
	dryRun: boolean
): Promise<MigrationResult[]> {
	const collection = db.collection("courses");
	const results: MigrationResult[] = [];

	// Find all courses with hosts array
	const courses = await collection.find({
		hosts: { $exists: true, $ne: null },
	}).toArray();

	for (const course of courses) {
		const hosts = course.hosts as Array<{ image?: string; title?: string; description?: string }>;
		if (!Array.isArray(hosts)) continue;

		let hasChanges = false;
		const updatedHosts = hosts.map((host, index) => {
			if (host.image && needsMigration(host.image)) {
				const newValue = extractMediaKey(host.image);
				if (host.image !== newValue) {
					results.push({
						collection: "courses",
						documentId: course._id.toString(),
						field: `hosts[${index}].image`,
						oldValue: host.image,
						newValue,
					});
					hasChanges = true;
					return { ...host, image: newValue };
				}
			}
			return host;
		});

		if (hasChanges && !dryRun) {
			await collection.updateOne(
				{ _id: course._id },
				{ $set: { hosts: updatedHosts } }
			);
		}
	}

	return results;
}

async function runMigration(dryRun: boolean) {
	console.log("🔄 Media URL Migration Script");
	console.log("================================");
	console.log(`Mode: ${dryRun ? "DRY RUN (no changes will be made)" : "LIVE (changes will be applied)"}`);
	console.log("");

	try {
		const db = await getDb();
		const allResults: MigrationResult[] = [];

		// Migrate projects.logo
		console.log("📁 Checking projects.logo...");
		const projectResults = await migrateCollection(db, "projects", "logo", dryRun);
		allResults.push(...projectResults);
		console.log(`   Found ${projectResults.length} items to migrate`);

		// Migrate teamMembers.picture
		console.log("📁 Checking teamMembers.picture...");
		const teamMemberResults = await migrateCollection(db, "teamMembers", "picture", dryRun);
		allResults.push(...teamMemberResults);
		console.log(`   Found ${teamMemberResults.length} items to migrate`);

		// Migrate courses.featuredImage
		console.log("📁 Checking courses.featuredImage...");
		const courseFeaturedResults = await migrateCollection(db, "courses", "featuredImage", dryRun);
		allResults.push(...courseFeaturedResults);
		console.log(`   Found ${courseFeaturedResults.length} items to migrate`);

		// Migrate courses.hosts[].image
		console.log("📁 Checking courses.hosts[].image...");
		const courseHostResults = await migrateHostsField(db, dryRun);
		allResults.push(...courseHostResults);
		console.log(`   Found ${courseHostResults.length} items to migrate`);

		// Migrate blogPosts.thumbnail
		console.log("📁 Checking blogPosts.thumbnail...");
		const blogPostResults = await migrateCollection(db, "blogPosts", "thumbnail", dryRun);
		allResults.push(...blogPostResults);
		console.log(`   Found ${blogPostResults.length} items to migrate`);

		console.log("");
		console.log("================================");
		console.log(`Total: ${allResults.length} items ${dryRun ? "would be" : "were"} migrated`);
		console.log("");

		if (allResults.length > 0) {
			console.log("Details:");
			console.log("--------");
			for (const result of allResults) {
				console.log(`  ${result.collection}.${result.field}:`);
				console.log(`    OLD: ${result.oldValue}`);
				console.log(`    NEW: ${result.newValue}`);
				console.log("");
			}
		}

		if (dryRun && allResults.length > 0) {
			console.log("💡 Run without --dry-run to apply these changes.");
		}

		if (!dryRun && allResults.length > 0) {
			console.log("✅ Migration completed successfully!");
		}

		if (allResults.length === 0) {
			console.log("✅ No migration needed - all URLs are already in key format.");
		}
	} catch (error) {
		console.error("❌ Migration failed:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

// Parse command line arguments
const dryRun = process.argv.includes("--dry-run");

runMigration(dryRun).then(() => {
	process.exit(0);
});

