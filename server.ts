// Polyfill URLPattern for Node.js environments that don't have it
// Must be imported first before any other imports that might use URLPattern
import './src/lib/polyfills.js'

import { paraglideMiddleware } from './src/paraglide/server.js'
import handler from '@tanstack/react-start/server-entry'

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, ({ request }) => handler.fetch(request))
  },
}

