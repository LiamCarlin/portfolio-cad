# PortfolioCAD Development Instructions

## Project Overview

This is a CAD-like portfolio website built with Next.js, Three.js, and Tailwind CSS. It simulates a professional CAD software interface to showcase engineering projects.

## Architecture

- **Framework**: Next.js 14 with App Router
- **State Management**: Zustand store at `src/store/usePortfolioStore.ts`
- **3D Rendering**: React Three Fiber + Drei at `src/components/viewport/Viewport.tsx`
- **UI Components**: Located in `src/components/` (layout, panels, overlays)
- **Project Data**: Define projects in `src/data/sampleProjects.ts`

## Key Files

- `src/store/usePortfolioStore.ts` - All app state and actions
- `src/components/CADLayout.tsx` - Main layout component
- `src/components/viewport/Viewport.tsx` - 3D scene
- `src/data/sampleProjects.ts` - Portfolio project definitions

## Development Patterns

### Adding New Projects
Add to the `sampleProjects` array in `src/data/sampleProjects.ts` following the `Project` interface.

### Adding Viewport Features
Modify `Viewport.tsx`. Use Drei helpers for common 3D functionality.

### State Management
All state flows through the Zustand store. Use `usePortfolioStore` hook to access state and actions.

### Styling
Use Tailwind CSS classes. Dark theme colors: gray-700 to gray-950 scale.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
