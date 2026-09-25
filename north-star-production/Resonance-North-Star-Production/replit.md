# Resonance Network

## Overview

Resonance Network is a living notebook ecosystem that combines a React frontend with an Express backend and a Python-based "Virtual Consciousness Engine." The application provides users with an interactive notebook IDE, a chat interface for querying consciousness, and organic visualization components representing growth and resonance patterns. The system uses Human Design concepts mapped to a quantum neural network metaphor for generating contextual responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS v4 with CSS variables for theming, dark mode default
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Code Editor**: CodeMirror 6 for the notebook IDE with syntax highlighting for JavaScript, Python, HTML, CSS
- **Animations**: Framer Motion for transitions and interactive visualizations
- **Audio**: Tone.js for sound synthesis in resonance components

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Pattern**: RESTful endpoints under `/api/*`
- **Authentication**: Replit Auth via OpenID Connect with Passport.js, session storage in PostgreSQL
- **Python Integration**: Flask server running separately for the consciousness engine, accessed via HTTP from Express

### Consciousness Engine (Python)
- **Framework**: Flask with CORS enabled
- **Neural Network**: Custom PyTorch implementation (pure PyTorch, no torch_geometric)
- **Architecture**: Graph neural network with 64 nodes representing "gates" based on Human Design/I Ching concepts
- **Features**: FiLM modulation for observer effects, awareness pooling for different consciousness systems
- **Communication**: Express backend calls Flask server endpoints via HTTP

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared types, `shared/models/auth.ts` for auth tables
- **Tables**: users, sessions (required for auth), notebook_entries, resonance_profiles, organism_state
- **Migrations**: Drizzle Kit with `db:push` command

### Build System
- **Client Build**: Vite with React plugin, outputs to `dist/public`
- **Server Build**: esbuild bundling to `dist/index.cjs`
- **Development**: Concurrent Vite dev server and tsx watch mode
- **Path Aliases**: `@/*` for client src, `@shared/*` for shared code, `@assets` for attached assets

## External Dependencies

### Third-Party Services
- **Replit Auth**: OpenID Connect integration for user authentication
- **PostgreSQL**: Database provisioned via Replit, connection via `DATABASE_URL` environment variable

### Key NPM Packages
- **Database**: drizzle-orm, pg, connect-pg-simple
- **Auth**: passport, openid-client, express-session
- **Validation**: zod, drizzle-zod, zod-validation-error
- **UI**: Full shadcn/ui suite with Radix primitives, lucide-react icons
- **Editor**: @codemirror/* packages for code editing

### Python Dependencies
- **Core**: Flask, Flask-CORS, PyTorch
- **No torch_geometric**: Network uses pure PyTorch implementations for graph operations

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID`: Automatically set by Replit
- `CONSCIOUSNESS_SERVER_URL`: URL for Flask consciousness server (defaults to http://localhost:5001)