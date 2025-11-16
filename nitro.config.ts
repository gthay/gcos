import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
	// Inline urlpattern-polyfill to ensure it's bundled with server code
	// This prevents it from being externalized and ensures it's available at runtime
	externals: {
		inline: ['urlpattern-polyfill'],
	},
})

