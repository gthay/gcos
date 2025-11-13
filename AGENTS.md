# Tanstack Start Website Project
Project Details and Guide for this project

## Project Description
We are building a website for the company "German Center of Open Source AI" or short GC.OS.

## Tech Stack
- JavaScript Framework: TanStack Start
- Language: TypeScript
- Package Manager: pnpm
- Database: MongoDB
- Auth: Better-Auth
- ORM: MongoDB native driver with Zod
- Linter / Formatter: Biome
- CSS: Tailwind CSS v4
- Components: shadcn/ui (including MCP Server to find components)
- Icons: lucide-react
- Animations: framer-motion
- Server State Management: TanStack Query
- Forms: TanStack React Form
- Environment Type Safety: t3-env
- Notifications / Toasts: sonner
- Validation: Zod
- Build Tool / Bundler: Vite (via TanStack Start)
- Server Runtime: Nitro (built into TanStack Start)
- Deployment: Dokploy
- Version Control: Git + GitHub
- Multi Language support: Paraglide JS


## What is TanStack Start
TanStack Start (short Tanstack) is a full-stack React meta-framework built on top of TanStack Router and Vite (with Nitro powering the server side). It provides type-safe routing, server functions / RPC-style backend logic, and out of the box SSR + streaming rendering, enabling you to build full-stack apps with both server-and client-side logic seamlessly.


## Architecture & File Structure

### Routing System
- **`src/routes/`**: File-based routing structure. Each file becomes a route (e.g., `src/routes/about.tsx` → `/about`)
- **`src/routes/__root.tsx`**: Root layout component containing the HTML shell, Header, and devtools
- **`src/router.tsx`**: Router initialization with context setup for TanStack Query
- **`routeTree.gen.ts`**: Auto-generated file; do not edit manually

### Key Integration Points
- **`src/integrations/tanstack-query/`**: Query client configuration and provider setup
  - `root-provider.tsx`: Creates and wraps the QueryClient
  - `devtools.tsx`: TanStack Query devtools integration
- **`src/env.ts`**: Type-safe environment variables using T3 Env. Server variables use `SERVER_URL`, client variables must be prefixed with `VITE_`

### UI Components
- **`src/components/`**: Reusable React components
- **`src/components/ui/`**: Shadcn UI components (button, input, select, slider, switch, label, textarea)
- Components use Tailwind CSS and `clsx` for conditional styling

### Styling
- **`src/styles.css`**: Global styles and Tailwind directives
- Uses Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Class utility composition via `class-variance-authority` for component variants

### Code Quality
- **Biome** (v2.2.4) handles both linting and formatting
  - Configured with tab indentation, double quotes for JS
  - Import organization enabled
  - Excluded files: `src/routeTree.gen.ts`, `src/styles.css`
- **TypeScript** strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- Path aliases configured: `@/*` maps to `./src/*`

## Demo Files

Files prefixed with `demo` in the codebase are for reference/learning and can be deleted:
- `src/routes/demo/`
- `src/data/demo.punk-songs.ts`
...

## Development Tips

### Adding New UI Components
```bash
pnpx shadcn@latest add [component-name]
```
Components are installed in `src/components/ui/`.

### Creating Routes
- Create a new file in `src/routes/` (e.g., `about.tsx`)
- Export a component using `createFileRoute`:
  ```tsx
  import { createFileRoute } from '@tanstack/react-router'
  export const Route = createFileRoute('/about')({ component: AboutPage })
  function AboutPage() { ... }
  ```
- Router tree auto-generates; use the Router Devtools to inspect

### Working with Server Functions
- Use `server$()` in TanStack Start to define server-side functions
- Automatically typed on the client; full type safety from server to client

### Environment Variables
- Add to `src/env.ts` with Zod validation
- Server: Add to `server` object
- Client: Add to `client` object with `VITE_` prefix (enforced)
- Access via `import { env } from '@/env'`

### Cursor/IDE Rules
Follow the instructions in `.cursorrules` for Shadcn component installation.

## Cursor AI Agent Guidelines & Best Practices

To keep this project consistent across all future Cursor sessions, follow these rules:

### 1. General Rules
- **Do not change the tech stack** (framework, DB, auth, major libs) unless explicitly asked.
- Prefer **small, incremental changes** over large refactors. If a refactor is needed, clearly explain it in comments and commit messages.
- When in doubt, follow **existing patterns** in the codebase instead of inventing new ones.

### 2. Package & Tooling Rules
- Use **pnpm** only. Do **not** add or use `npm` or `yarn` lockfiles.
- Keep **Biome** as the single source of truth for formatting & linting:
  - Run `pnpm format` and `pnpm lint` before committing.
  - Do not add ESLint / Prettier configs unless explicitly requested.
- Do **not auto-upgrade dependencies** or change versions unless the user explicitly asks for it.

### 3. Tech Stack Consistency
- This is a **TanStack Start** project (not Next.js). Avoid introducing Next.js-specific patterns (`pages/`, `app/` directory, `getServerSideProps`, etc.).
- For DB access, use **MongoDB native driver with Zod**. Do **not** add Mongoose or other ORMs.
- For validation, use **Zod**. Do not introduce additional validation libraries.
- For forms, prefer **TanStack React Form**; for server state, use **TanStack Query**.
- For UI, use **Tailwind v4 + shadcn/ui + lucide-react + framer-motion**. Do not mix in other UI kits unless required.

### 4. Files & Architecture Conventions
- **Generated files:** Do not manually edit:
  - `src/routeTree.gen.ts`
  - Any other clearly marked auto-generated files
- **Routing:** New routes go into `src/routes/` and use `createFileRoute`.
- **Env variables:** 
  - Add them via `src/env.ts` using Zod and t3-env.
  - Client-side env vars must be prefixed with `VITE_`.
  - Never hardcode secrets in source files.
- **Components:**
  - Reusable UI components go in `src/components/` or `src/components/ui/` (for shadcn).
  - Reuse existing patterns for props, variants, and class names (`cva`, `clsx`).

### 5. Git & Repository Hygiene
- Write **clear commit messages** that explain what changed and why.
- Avoid committing commented-out code blocks—remove dead code instead, unless they document an active TODO.

### 6. Documentation & Comments
- When adding complex logic (auth, DB queries, server functions), include **short, clear comments**.
- If you change an existing pattern or introduce a new convention, **update this AGENTS.md** and any relevant docs.
- Keep terminology consistent: use **“GC.OS”** and **“German Center of Open Source AI”** as described above.
