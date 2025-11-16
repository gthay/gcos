// CRITICAL: Polyfill URLPattern for Node.js environments
// Must be imported FIRST before any other imports that might use URLPattern
// This ensures URLPattern is available globally before Paraglide middleware executes
import { URLPattern } from 'urlpattern-polyfill'

// Explicitly assign to global scope to ensure it's available
if (typeof globalThis !== 'undefined' && !globalThis.URLPattern) {
	globalThis.URLPattern = URLPattern
}
// Also assign to global for Node.js environments
if (typeof global !== 'undefined' && !global.URLPattern) {
	global.URLPattern = URLPattern
}

import { paraglideMiddleware } from './src/paraglide/server.js'
import handler from '@tanstack/react-start/server-entry'

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, ({ request }) => handler.fetch(request))
  },
}

