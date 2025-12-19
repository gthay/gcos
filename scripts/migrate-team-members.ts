/**
 * Migration script for Team Members
 *
 * Migrates team members from the old schema to the new schema:
 * Old: { name, positionDe, positionEn, project }
 * New: { firstName, lastName, roles, rolesDe, projects, ... }
 *
 * Run with: npx tsx scripts/migrate-team-members.ts
 * Or dry run: npx tsx scripts/migrate-team-members.ts --dry-run
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const DRY_RUN = process.argv.includes("--dry-run");

if (!MONGODB_URI) {
	console.error("Error: MONGODB_URI environment variable is not set");
	process.exit(1);
}

// Role mapping from position text to roles
const ROLE_MAPPING: Record<string, { en: string; de: string }[]> = {
	// Common role keywords
	"core developer": [{ en: "Core Developer", de: "Kernentwickler" }],
	kernentwickler: [{ en: "Core Developer", de: "Kernentwickler" }],
	"council member": [{ en: "Council Member", de: "Ratsmitglied" }],
	ratsmitglied: [{ en: "Council Member", de: "Ratsmitglied" }],
	consultant: [{ en: "Consultant", de: "Berater" }],
	berater: [{ en: "Consultant", de: "Berater" }],
	"course instructor": [{ en: "Course Instructor", de: "Kursleiter" }],
	kursleiter: [{ en: "Course Instructor", de: "Kursleiter" }],
	"council observer": [{ en: "Council Observer", de: "Ratsbeobachter" }],
	ratsbeobachter: [{ en: "Council Observer", de: "Ratsbeobachter" }],
	"junior engineer": [{ en: "Junior Engineer", de: "Junior-Entwickler" }],
	"junior-entwickler": [{ en: "Junior Engineer", de: "Junior-Entwickler" }],
};

function parseRolesFromPosition(
	positionEn: string,
	positionDe: string
): { roles: string[]; rolesDe: string[] } {
	const roles: string[] = [];
	const rolesDe: string[] = [];

	const positionLower = positionEn.toLowerCase();

	for (const [keyword, roleMapping] of Object.entries(ROLE_MAPPING)) {
		if (positionLower.includes(keyword)) {
			for (const role of roleMapping) {
				if (!roles.includes(role.en)) {
					roles.push(role.en);
					rolesDe.push(role.de);
				}
			}
		}
	}

	// If no roles found, use the position as-is as a single role
	if (roles.length === 0 && positionEn) {
		roles.push(positionEn);
		rolesDe.push(positionDe || positionEn);
	}

	return { roles, rolesDe };
}

function splitName(fullName: string): { firstName: string; lastName: string } {
	const parts = fullName.trim().split(/\s+/);
	if (parts.length === 1) {
		return { firstName: parts[0], lastName: "" };
	}
	const firstName = parts[0];
	const lastName = parts.slice(1).join(" ");
	return { firstName, lastName };
}

async function migrate() {
	console.log(
		DRY_RUN
			? "🔍 DRY RUN - No changes will be made"
			: "🚀 Running migration..."
	);
	console.log("");

	const client = new MongoClient(MONGODB_URI!);

	try {
		await client.connect();
		console.log("✅ Connected to MongoDB");

		const db = client.db();
		const collection = db.collection("teamMembers");

		// Find all team members with old schema (have 'name' field but no 'firstName')
		const oldMembers = await collection
			.find({
				name: { $exists: true },
				firstName: { $exists: false },
			})
			.toArray();

		console.log(`Found ${oldMembers.length} team members to migrate\n`);

		if (oldMembers.length === 0) {
			console.log("No team members need migration.");
			return;
		}

		let migratedCount = 0;
		let errorCount = 0;

		for (const member of oldMembers) {
			try {
				// Parse old fields
				const { firstName, lastName } = splitName(member.name || "");
				const { roles, rolesDe } = parseRolesFromPosition(
					member.positionEn || "",
					member.positionDe || ""
				);
				const projects = member.project ? [member.project] : [];

				const update = {
					$set: {
						firstName,
						lastName,
						roles,
						rolesDe,
						projects,
						// Set optional fields with defaults
						expertiseEn: "",
						expertiseDe: "",
						githubUrl: "",
						linkedinUrl: "",
						websiteUrl: "",
						primaryAffiliation: "",
						showAffiliation: false,
						updatedAt: new Date(),
					},
					$unset: {
						name: "",
						positionEn: "",
						positionDe: "",
						project: "",
					},
				};

				console.log(`📝 ${member.name}:`);
				console.log(`   First Name: "${firstName}"`);
				console.log(`   Last Name: "${lastName}"`);
				console.log(`   Roles (EN): ${roles.join(", ") || "(none)"}`);
				console.log(`   Roles (DE): ${rolesDe.join(", ") || "(none)"}`);
				console.log(`   Projects: ${projects.join(", ") || "(none)"}`);

				if (!DRY_RUN) {
					await collection.updateOne({ _id: member._id }, update);
					console.log("   ✅ Migrated\n");
				} else {
					console.log("   ⏭️  Would migrate (dry run)\n");
				}

				migratedCount++;
			} catch (error) {
				console.error(`   ❌ Error migrating ${member.name}:`, error);
				errorCount++;
			}
		}

		console.log("\n" + "=".repeat(50));
		console.log(`Migration complete:`);
		console.log(`  ✅ ${migratedCount} migrated`);
		console.log(`  ❌ ${errorCount} errors`);

		if (DRY_RUN) {
			console.log(
				"\n💡 This was a dry run. Run without --dry-run to apply changes."
			);
		}
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	} finally {
		await client.close();
		console.log("\n✅ Disconnected from MongoDB");
	}
}

migrate().then(() => {
	process.exit(0);
});

