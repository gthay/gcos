// Polyfill URLPattern for Node.js environments
// This file must be imported before any code that uses URLPattern
import { URLPattern } from 'urlpattern-polyfill'

// Explicitly ensure URLPattern is available in global scope
// This is necessary for Node.js environments that don't have URLPattern natively
if (typeof globalThis !== 'undefined' && !globalThis.URLPattern) {
	globalThis.URLPattern = URLPattern
}

