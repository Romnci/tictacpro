# TicTacPro - Multiplayer Tic-Tac-Toe Arena

[![Deploy to GitHub Pages](https://github.com/username/tictacpro/actions/workflows/deploy.yml/badge.svg)](https://github.com/username/tictacpro/actions/workflows/deploy.yml)

A modern, multiplayer tic-tac-toe application built with React, Express.js, and PostgreSQL. Features real-time gaming, chat system, user authentication, and competitive leaderboards.

## 🚀 Features

- **Real-time Multiplayer Gaming** - Play against opponents worldwide
- **User Authentication** - Secure login with Replit Auth
- **Live Chat System** - Communicate with opponents during matches
- **Room Management** - Create private or public game rooms
- **Tag System** - Organize games by categories (casual, competitive, speed, tournament)
- **Leaderboards** - Track wins, losses, streaks, and best times
- **Responsive Design** - Works perfectly on desktop and mobile
- **Dark Theme** - Beautiful dark UI with gradient accents

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for lightweight routing
- **TanStack React Query** for server state management
- **Shadcn/UI** components with Radix UI primitives
- **Tailwind CSS** for styling
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **TypeScript** with ESM modules
- **Replit Auth** with OpenID Connect
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for type-safe database operations
- **Express Sessions** with PostgreSQL storage

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express Server │────│   PostgreSQL    │
│                 │    │                 │    │    Database     │
│ • Game UI       │    │ • Authentication│    │ • Users         │
│ • Chat System   │    │ • Game Logic    │    │ • Rooms         │
│ • Room Management│   │ • Real-time API │    │ • Games         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tictacpro.git
   cd tictacpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure these variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_random_secret_key
   REPL_ID=your_replit_project_id
   REPLIT_DOMAINS=your-domain.com
   ISSUER_URL=https://replit.com/oidc
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📦 Deployment

### Deploy to Replit
```bash
./deploy.sh replit
```

### Deploy with Docker
```bash
./deploy.sh docker
```

### Deploy to GitHub Pages
```bash
./deploy.sh github
```

### Custom Domain Setup
```bash
./deploy.sh domain your-domain.com
```

## 🎮 How to Play

1. **Create an Account** - Sign up using Replit Auth
2. **Join a Room** - Browse available rooms or create your own
3. **Start Playing** - Make moves by clicking on the game board
4. **Chat with Opponents** - Use the built-in chat system
5. **Track Progress** - View your stats and climb the leaderboards

## 🏗️ Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API routes
│   └── replitAuth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── .github/workflows/     # CI/CD configurations
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Type checking

### Database Schema

The application uses the following main tables:
- **users** - User profiles and statistics
- **rooms** - Game rooms with settings
- **games** - Individual game instances
- **messages** - Chat messages
- **room_participants** - Room membership tracking

## 🔒 Security Features

- **Session Management** - Secure HTTP-only cookies
- **CSRF Protection** - Built-in request validation
- **Rate Limiting** - API endpoint protection
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Drizzle ORM parameterized queries

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Replit](https://replit.com) for hosting and authentication
- [Shadcn/UI](https://ui.shadcn.com) for beautiful components
- [Neon](https://neon.tech) for serverless PostgreSQL
- [Vercel](https://vercel.com) for inspiration on developer experience

## 📞 Support

If you have any questions or need help:
- Open an [issue](https://github.com/yourusername/tictacpro/issues)
- Join our [Discord community](https://discord.gg/tictacpro)
- Email: support@tictacpro.com

---

**Made with ❤️ by the TicTacPro Team**

🎯 Challenge players worldwide and become the ultimate tic-tac-toe champion!