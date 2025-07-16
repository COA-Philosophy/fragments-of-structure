# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start development server on http://localhost:3000
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint for code quality checks
```

## Architecture Overview

This is a Next.js 15 application for creating and sharing code-based visual art. The codebase uses a multi-engine code execution system that automatically detects and runs different types of creative code (Canvas 2D, Three.js/WebGL).

### Key Architectural Components

1. **Executor System** (`src/utils/executors/`)
   - `ExecutorFactory` manages multiple code execution engines
   - `CanvasExecutor` handles Canvas 2D API code
   - `ThreeExecutor` handles Three.js/WebGL code
   - Automatic code analysis determines the optimal engine
   - Built-in error handling with fallback mechanisms

2. **API Routes** (`src/app/api/`)
   - Fragment CRUD operations at `/api/fragments`
   - Interaction endpoints: `/api/fragments/[id]/resonate` and `/api/fragments/[id]/whisper`
   - All routes use Next.js Route Handlers with TypeScript

3. **Component Organization**
   - `components/design-system/` contains reusable UI components with bilingual support
   - `components/canvas/` handles code preview and execution
   - `components/gallery/` manages fragment display and interactions
   - All components follow the established design token system

4. **Database Integration**
   - Supabase client configured in `src/lib/supabase.ts`
   - Tables: fragments, resonances, whispers
   - Bilingual fields use `_primary` and `_secondary` suffixes

5. **Type System**
   - Strict TypeScript configuration
   - Core types in `src/types/fragment.ts`
   - Executor types in `src/utils/executors/types.ts`

### Important Design Patterns

- **Factory Pattern**: ExecutorFactory for managing code execution engines
- **Bilingual Support**: All text content supports English/Japanese with primary/secondary fields
- **Anonymous User System**: IP-based hashing for user identification without authentication
- **Design Tokens**: Comprehensive design system in `src/components/design-system/tokens/designTokens.ts`

### Environment Setup

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Common Development Tasks

When adding new code execution capabilities:
1. Create a new executor in `src/utils/executors/`
2. Register it in `ExecutorFactory`
3. Update type detection in `codeAnalyzer.ts`

When modifying the UI:
1. Use existing design tokens for consistency
2. Ensure bilingual support for all text
3. Follow the established component patterns