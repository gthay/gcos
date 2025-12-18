/**
 * Script to set admin role for a user
 * Usage: pnpm tsx scripts/set-admin-role.ts <email>
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

async function setAdminRole(email: string) {
	try {
		const db = await getDb();
		const userCollection = db.collection("user");
		
		// Find the user by email
		const user = await userCollection.findOne({ email });
		
		if (!user) {
			console.error(`❌ User with email "${email}" not found.`);
			process.exit(1);
		}
		
		console.log(`Found user: ${user.email} (ID: ${user.id || user._id})`);
		
		// Update the role field directly in MongoDB
		// Better Auth stores roles in the "role" field
		const result = await userCollection.updateOne(
			{ email },
			{ $set: { role: "admin" } }
		);
		
		if (result.matchedCount === 0) {
			console.error(`❌ User not found after initial lookup.`);
			process.exit(1);
		}
		
		if (result.modifiedCount === 0) {
			console.log(`ℹ️  User "${email}" already has admin role.`);
		} else {
			console.log(`✅ Successfully set admin role for ${email}`);
			console.log(`   User can now access the Users management page.`);
		}
	} catch (error) {
		console.error("❌ Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
	console.error("❌ Please provide an email address.");
	console.error("Usage: pnpm tsx scripts/set-admin-role.ts <email>");
	process.exit(1);
}

setAdminRole(email).then(() => {
	process.exit(0);
});


