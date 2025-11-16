import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    // Plugin order matching the TanStack Router example:
    // tailwindcss first, then paraglide, then tanstackStart, then nitro, then react
    tailwindcss(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      cookieName: 'PARAGLIDE_LOCALE',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/',
          localized: [
            ['en', '/'],
            ['de', '/de'],
          ],
        },
        {
          pattern: '/about',
          localized: [
            ['en', '/about'],
            ['de', '/de/ueber'],
          ],
        },
        {
          pattern: '/contact',
          localized: [
            ['en', '/contact'],
            ['de', '/de/kontakt'],
          ],
        },
        {
          pattern: '/:path(.*)?',
          localized: [
            ['en', '/:path(.*)?'],
            ['de', '/de/:path(.*)?'],
          ],
        },
      ],
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
})

export default config
