# TicTacPro - Multiplayer Tic-Tac-Toe Arena

## Overview

TicTacPro is a full-stack multiplayer tic-tac-toe application built with React, Express, and PostgreSQL. The application provides real-time gaming experiences with features like room-based matchmaking, live chat, leaderboards, and user statistics tracking. It uses modern web technologies and is designed for deployment on Replit with integrated authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with consistent error handling
- **Middleware**: Custom logging, JSON parsing, and authentication guards

### Database Layer
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC discovery
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **User Management**: Automatic user creation and profile synchronization
- **Security**: HTTP-only cookies with secure flags in production

### Game Management
- **Room System**: Create and join game rooms with customizable settings
- **Game State**: Real-time board state tracking with turn management
- **Participant Management**: Room-based user tracking and capacity limits
- **Game Logic**: Server-side validation for moves and win conditions

### Communication Features
- **Real-time Chat**: Room-based messaging system
- **User Interaction**: Quick reaction system with emoji support
- **Notifications**: Toast-based user feedback system

### User Statistics
- **Performance Tracking**: Wins, losses, games played, and streaks
- **Leaderboards**: Global ranking system based on performance metrics
- **Time Tracking**: Best game completion times

## Data Flow

1. **Authentication Flow**:
   - User initiates login via Replit Auth
   - Server validates OIDC tokens and creates/updates user profile
   - Session established with PostgreSQL storage
   - Client receives user data and authentication state

2. **Game Flow**:
   - User creates or joins a room
   - Server validates room capacity and user permissions
   - Game state initialized and participants added
   - Real-time updates via polling for board state and chat messages
   - Game completion triggers statistics updates

3. **Real-time Updates**:
   - Client polls server endpoints for live data (rooms, games, messages)
   - Optimistic updates for immediate user feedback
   - Server-side validation ensures data consistency

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management and caching
- **express**: Web server framework
- **openid-client**: Authentication provider integration

### UI Dependencies
- **@radix-ui/**: Accessible component primitives
- **class-variance-authority**: Component variant management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for server development

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native Replit development tools and runtime error overlay
- **Hot Reload**: Vite HMR for frontend, tsx watch for backend
- **Database**: Neon serverless for consistent development/production parity

### Production Build
- **Frontend**: Vite production build with optimized bundles
- **Backend**: ESBuild compilation to ESM format
- **Assets**: Static file serving through Express
- **Environment**: NODE_ENV-based configuration switching

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OIDC provider URL (defaults to Replit)

## GitHub Repository

- **Repository**: https://github.com/Romnci/tictacpro
- **Live Site**: https://romnci.github.io/tictacpro (pending configuration)
- **GitHub Username**: Romnci

## Deployment Configuration

The application is configured for multiple deployment options:
- **Replit Hosting**: Current development environment
- **GitHub Pages**: Static site deployment with GitHub Actions
- **Docker**: Containerized deployment with nginx reverse proxy
- **Custom Domain**: Ready for custom domain configuration

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. GitHub repository created and deployment configured
  * Repository: https://github.com/Romnci/tictacpro
  * GitHub Actions workflows for automated deployment
  * Docker configuration for containerized hosting
  * nginx reverse proxy configuration
  * SSL/TLS support with Let's Encrypt integration
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```