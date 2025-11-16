// CRITICAL: Load URLPattern polyfill BEFORE any Paraglide imports
// This ensures URLPattern is available when deLocalizeUrl/localizeUrl are called
import { URLPattern } from 'urlpattern-polyfill'
if (typeof globalThis !== 'undefined' && !globalThis.URLPattern) {
	globalThis.URLPattern = URLPattern
}
if (typeof global !== 'undefined' && !global.URLPattern) {
	global.URLPattern = URLPattern
}

import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime.js'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...rqContext}>
          {props.children}
        </TanstackQuery.Provider>
      )
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}
