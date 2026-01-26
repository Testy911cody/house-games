# House Games 🏠

A cozy treehouse-themed website where friends come to play social games together!

## Features

- **Anonymous Play**: Jump right in without creating an account
- **Profile System**: Create profiles to save your progress and track stats
- **10+ Games**: Jeopardy, Taboo, Codenames, DrawGuess, Flappy Bird, Ludo, Maze, Monopoly, Pacman, Werewolf, and more!
- **Beautiful Treehouse Theme**: Immersive design that makes you feel like you're in a treehouse with friends

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   Or use the launcher script:
   ```bash
   scripts\start-housegames.bat
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Games

- **Jeopardy** - Trivia game with AI-powered topic generation
- **Taboo** - Word-guessing game with forbidden words
- **Codenames** - Word association game
- **DrawGuess** - Drawing and guessing game
- **Flappy Bird** - Classic arcade game
- **Ludo** - Board game
- **Maze** - Puzzle game
- **Monopoly** - Board game
- **Pacman** - Classic arcade game
- **Werewolf** - Social deduction game

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Local Storage for data persistence

## Project Structure

```
HouseGames/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── games/             # Game pages
│   ├── groups/            # Group management
│   ├── profile/           # User profiles
│   └── suggestions/       # Suggestions page
├── docs/                   # Documentation
│   ├── deployment/       # Deployment guides
│   ├── development/      # Development guides
│   ├── archive/          # Old documentation
│   └── personal/        # Personal files
├── scripts/               # Utility scripts
│   ├── setup-git.bat     # Git setup helper
│   ├── deploy-nightly.bat # Nightly deployment
│   └── start-housegames.bat # Development launcher
├── public/                # Static assets
└── [config files]        # Next.js, TypeScript, etc.
```

## Documentation

All documentation is organized in the `docs/` folder:

- **[Deployment Guide](docs/deployment/DEPLOYMENT.md)** - Complete deployment instructions
- **[Security Guide](docs/development/SECURITY.md)** - Security best practices
- **[API Keys Guide](docs/development/API_KEYS.md)** - Understanding API keys
- **[Documentation Index](docs/README.md)** - Full documentation index

## Deployment

**Quick Deploy to GitHub Pages:**

1. **Set up Git** (if not done):
   ```bash
   scripts\setup-git.bat
   ```

2. **Push to GitHub** and enable GitHub Pages:
   - Go to repository → Settings → Pages
   - Select branch: `gh-pages` (or `main`)
   - Save

3. **Your site is live!** 🎉
   - URL: `https://YOUR_USERNAME.github.io/house-games/`
   - Unlimited deploys, free forever!

4. **See [GitHub Pages Guide](docs/deployment/GITHUB_PAGES.md)** for detailed instructions

## Scripts

- `scripts\setup-git.bat` - Initialize Git repository
- `scripts\start-housegames.bat` - Start development server
- `scripts\deploy-nightly.bat` - Trigger nightly deployment

## Development

- **Local Development**: `npm run dev`
- **Build**: `npm run build`
- **Start Production**: `npm start`
- **Lint**: `npm run lint`

## License

This project is private/personal use.

