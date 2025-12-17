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
	// Don't copy node_modules to output - use them directly from source
	// This ensures package.json "imports" fields work correctly
	nodeModulesDirs: ['node_modules'],
	// Don't copy node_modules to output directory
	// This way packages are resolved from the original node_modules with intact package.json
	output: {
		dir: '.output',
		serverDir: '.output/server',
		publicDir: '.output/public',
	},
	// Rollup configuration to mark ALL packages as external
	// This prevents bundling and ensures packages are resolved from node_modules
	rollup: {
		external: (id) => {
			// Mark all node_modules packages as external
			// This ensures they're not bundled and package.json "imports" fields work
			if (!id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\\')) {
				// It's a package import, keep it external
				return true
			}
			return false
		},
	},
	// Experimental options
	experimental: {
		wasm: false,
	},
})

