import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
	// Inline urlpattern-polyfill to ensure it's bundled with server code
	externals: {
		inline: ['urlpattern-polyfill'],
	},
	// By default, Nitro externalizes all node_modules (noExternals: false)
	// This ensures TanStack Start packages remain external and their package.json "imports" work
	// The node_modules will be copied to .output/server/node_modules automatically
	noExternals: false,
})

