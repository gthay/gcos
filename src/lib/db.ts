import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
	if (!client) {
		// Lazy import env to avoid validation at module load time
		const { env } = await import("@/env");
		client = new MongoClient(env.MONGODB_URI);
		await client.connect();
	}
	return client;
}

export async function getDb(): Promise<Db> {
	if (!db) {
		// Lazy import env to avoid validation at module load time
		const { env } = await import("@/env");
		const client = await getMongoClient();
		const dbName = env.MONGODB_DB_NAME || "gcos";
		db = client.db(dbName);
	}
	return db;
}

