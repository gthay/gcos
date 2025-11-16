import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

const config = defineConfig({
  plugins: [
    devtools(),
    // Paraglide plugin must come before tanstackStart
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
    viteReact(),
    tailwindcss(),
  ],
})

export default config
