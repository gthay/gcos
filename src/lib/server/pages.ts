import { createServerFn } from "@tanstack/react-start";
import { getPagesCollection } from "../db/collections";
import type { Page, PageCreate, PredefinedPageId } from "../schemas/page";
import { PREDEFINED_PAGES } from "../schemas/page";

// Get all predefined pages (with their current content if exists)
export const getPages = createServerFn({ method: "GET" }).handler(async () => {
	const collection = await getPagesCollection();
	const existingPages = await collection.find({}).toArray();

	// Map predefined pages with their content (or empty defaults)
	return PREDEFINED_PAGES.map((predefined) => {
		const existing = existingPages.find((p) => p._id === predefined.id);
		return {
			_id: predefined.id,
			labelEn: predefined.labelEn,
			labelDe: predefined.labelDe,
			titleEn: existing?.titleEn || "",
			titleDe: existing?.titleDe || "",
			contentEn: existing?.contentEn || "",
			contentDe: existing?.contentDe || "",
			updatedAt: existing?.updatedAt,
			hasContent: !!(existing?.contentEn || existing?.contentDe),
		};
	});
});

// Get a single page by ID
export const getPage = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		const collection = await getPagesCollection();
		const page = await collection.findOne({ _id: id });

		if (!page) {
			// Return empty page structure for predefined pages
			const predefined = PREDEFINED_PAGES.find((p) => p.id === id);
			if (predefined) {
				return {
					_id: predefined.id,
					titleEn: "",
					titleDe: "",
					contentEn: "",
					contentDe: "",
				} as Page;
			}
			return null;
		}

		return page;
	});

// Get a page for public display (by ID and locale)
export const getPublicPage = createServerFn({ method: "GET" })
	.inputValidator((input: { id: string; locale: "en" | "de" }) => input)
	.handler(async ({ data }) => {
		const { id, locale } = data;

		const collection = await getPagesCollection();
		const page = await collection.findOne({ _id: id });

		if (!page) {
			return null;
		}

		return {
			title: locale === "de" ? page.titleDe : page.titleEn,
			content: locale === "de" ? page.contentDe : page.contentEn,
		};
	});

// Update or create a page (upsert)
export const updatePage = createServerFn({ method: "POST" })
	.inputValidator((data: { id: PredefinedPageId; data: PageCreate }) => data)
	.handler(async ({ data: { id, data } }) => {
		// Verify this is a predefined page
		const predefined = PREDEFINED_PAGES.find((p) => p.id === id);
		if (!predefined) {
			throw new Error("Invalid page ID");
		}

		const collection = await getPagesCollection();

		const result = await collection.updateOne(
			{ _id: id },
			{
				$set: {
					titleEn: data.titleEn,
					titleDe: data.titleDe,
					contentEn: data.contentEn,
					contentDe: data.contentDe,
					updatedAt: new Date(),
				},
				$setOnInsert: {
					_id: id,
				},
			},
			{ upsert: true }
		);

		return { success: true, upsertedId: result.upsertedId };
	});
