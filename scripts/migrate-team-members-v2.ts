/**
 * Migration script for Team Members v2
 *
 * Migrates team members from the old schema to the new simplified schema:
 * Old: { firstName, lastName, roles[], rolesDe[], projects[], expertiseEn, expertiseDe, ... }
 * New: { firstName, lastName, isCouncil, councilTitle, isConsultant, consultantTitle, isCourseInstructor, courseInstructorTitle, projects[], ... }
 *
 * Run with: npx tsx scripts/migrate-team-members-v2.ts
 * Or dry run: npx tsx scripts/migrate-team-members-v2.ts --dry-run
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

		// Find all team members that still have the old 'roles' array
		const oldMembers = await collection
			.find({
				roles: { $exists: true },
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
				const roles = member.roles || [];
				const fullName = [member.firstName, member.lastName]
					.filter(Boolean)
					.join(" ");

				// Determine boolean flags based on old roles
				const isCouncil =
					roles.includes("Council Member") ||
					roles.includes("Council Observer");
				const isConsultant = roles.includes("Consultant");
				const isCourseInstructor = roles.includes("Course Instructor");

				// Remove "GC.OS" from projects if present
				const projects = (member.projects || []).filter(
					(p: string) => p !== "GC.OS"
				);

				const update = {
					$set: {
						isCouncil,
						councilTitle: isCouncil
							? roles.includes("Council Observer")
								? "Council Observer"
								: ""
							: "",
						isConsultant,
						consultantTitle: "", // Will use default "Consultant"
						isCourseInstructor,
						courseInstructorTitle: "", // Will use default "Course Instructor"
						projects,
						updatedAt: new Date(),
					},
					$unset: {
						roles: "",
						rolesDe: "",
						expertiseEn: "",
						expertiseDe: "",
						primaryAffiliation: "",
						showAffiliation: "",
					},
				};

				console.log(`📝 ${fullName}:`);
				console.log(`   Old roles: ${roles.join(", ") || "(none)"}`);
				console.log(`   isCouncil: ${isCouncil}`);
				console.log(`   isConsultant: ${isConsultant}`);
				console.log(`   isCourseInstructor: ${isCourseInstructor}`);
				console.log(`   Projects: ${projects.join(", ") || "(none)"}`);

				if (!DRY_RUN) {
					await collection.updateOne({ _id: member._id }, update);
					console.log("   ✅ Migrated\n");
				} else {
					console.log("   ⏭️  Would migrate (dry run)\n");
				}

				migratedCount++;
			} catch (error) {
				const fullName = [member.firstName, member.lastName]
					.filter(Boolean)
					.join(" ");
				console.error(`   ❌ Error migrating ${fullName}:`, error);
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

