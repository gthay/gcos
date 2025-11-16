import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
	preset: 'node-server',
	compatibilityDate: '2025-11-16',
	// Preserve package.json "imports" field for TanStack Start packages
	// This prevents ERR_PACKAGE_IMPORT_NOT_DEFINED errors
	externals: {
		// Inline urlpattern-polyfill to ensure it's bundled
		inline: ['urlpattern-polyfill'],
	},
	// Don't bundle node_modules - keep them external to preserve package.json "imports"
	// This is critical: by keeping packages external, their package.json "imports" field is preserved
	noExternals: false,
	// Ensure node_modules structure is preserved and copied correctly
	nodeModulesDirs: ['node_modules'],
	// Copy node_modules to output to preserve package.json structure
	output: {
		dir: '.output',
		serverDir: '.output/server',
		publicDir: '.output/public',
	},
	// Rollup configuration to mark TanStack packages as external
	rollup: {
		external: (id) => {
			// Keep all @tanstack packages external to preserve their package.json "imports" field
			if (id.startsWith('@tanstack/')) {
				return true
			}
			return false
		},
	},
	// Experimental options to preserve package structure
	experimental: {
		wasm: false,
	},
	// Ensure all dependencies are treated as external
	// This prevents bundling and preserves package.json "imports" field
	imports: {
		presets: [],
	},
})

