import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
	// Inline urlpattern-polyfill to ensure it's bundled with server code
	externals: {
		inline: ['urlpattern-polyfill'],
		// Externalize TanStack Start packages to avoid package import resolution issues
		// These packages use package.json "imports" field which doesn't work well when bundled
	},
	// Ensure TanStack packages are not bundled
	noExternals: false,
})

