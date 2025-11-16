import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
	preset: 'node-server',
	// Inline urlpattern-polyfill to ensure it's bundled with server code
	externals: {
		inline: ['urlpattern-polyfill'],
	},
	// Ensure node_modules are preserved for external packages
	// This is critical for TanStack Start packages that use package.json "imports" field
	// By default, Nitro externalizes node_modules, which preserves package.json "imports"
	noExternals: false,
	// Ensure all @tanstack packages remain external to preserve their package.json structure
	nodeModulesDirs: ['node_modules'],
})

