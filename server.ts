// CRITICAL: Import polyfills FIRST before any other imports
// This ensures URLPattern is available globally for Paraglide's URL pattern matching
import './src/lib/polyfills'

import { 
  extractLocaleFromUrl, 
  deLocalizeUrl, 
  overwriteGetLocale,
  overwriteGetUrlOrigin,
  type Locale
} from './src/paraglide/runtime.js'
import handler from '@tanstack/react-start/server-entry'

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    
    // Extract locale from URL (before de-localization)
    const locale = extractLocaleFromUrl(req.url) as Locale
    
    // Override getLocale for this request
    overwriteGetLocale(() => locale)
    overwriteGetUrlOrigin(() => url.origin)
    
    // De-localize the URL for internal routing
    // /de/impressum -> /imprint
    const deLocalizedUrl = deLocalizeUrl(req.url)
    
    const deLocalizedRequest = new Request(deLocalizedUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      // @ts-ignore - duplex is needed for streaming bodies
      duplex: req.body ? 'half' : undefined,
    })
    
    return handler.fetch(deLocalizedRequest)
  },
}

