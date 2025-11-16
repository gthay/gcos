import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
	// Inline urlpattern-polyfill to ensure it's bundled with server code
	externals: {
		inline: ['urlpattern-polyfill'],
	},
	// Ensure node_modules are preserved for external packages
	// This is critical for TanStack Start packages that use package.json "imports" field
	noExternals: false,
})

