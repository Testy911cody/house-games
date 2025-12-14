# 📁 Project Structure Guide

Clear explanation of all files and folders in the HouseGames project.

---

## 🎯 Root Directory

### Configuration Files

**Essential config files (must stay in root):**
- `package.json` - Node.js dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `netlify.toml` - Netlify deployment configuration
- `next-env.d.ts` - Next.js TypeScript definitions

**These files must be in the root** - they're required by Next.js, TypeScript, and build tools.

---

## 📂 Main Directories

### `app/` - Application Code

Next.js App Router directory containing all application code.

```
app/
├── api/                    # API routes (server-side)
│   └── generate-jeopardy-topic/
│       └── route.ts       # Jeopardy topic generation API
├── components/            # Reusable React components
│   └── HomeButton.tsx    # Home button component
├── games/                 # Game pages
│   ├── codenames/        # Codenames game
│   ├── drawguess/        # DrawGuess game
│   ├── flappy/           # Flappy Bird game
│   ├── jeopardy/         # Jeopardy game
│   ├── ludo/             # Ludo game
│   ├── maze/             # Maze game
│   ├── monopoly/         # Monopoly game
│   ├── pacman/           # Pacman game
│   ├── taboo/            # Taboo game
│   ├── werewolf/         # Werewolf game
│   └── page.tsx          # Games listing page
├── groups/               # Group management
│   ├── [id]/            # Individual group page
│   ├── create/          # Create group page
│   └── page.tsx         # Groups listing page
├── profile/              # User profiles
│   ├── create/          # Create profile page
│   └── page.tsx         # Profile page
├── suggestions/         # Suggestions page
│   └── page.tsx
├── layout.tsx           # Root layout component
├── page.tsx             # Home page
└── globals.css          # Global styles
```

### `docs/` - Documentation

All project documentation organized by category.

```
docs/
├── deployment/          # Deployment guides
│   └── DEPLOYMENT.md    # Complete deployment guide
├── development/         # Development guides
│   ├── SECURITY.md      # Security best practices
│   └── API_KEYS.md      # API keys guide
├── archive/            # Old/legacy documentation
│   └── [old guides]    # Consolidated into new docs
├── personal/           # Personal files
│   └── [resume files]  # Resume documents
└── README.md           # Documentation index
```

### `scripts/` - Utility Scripts

Windows batch scripts for common tasks.

```
scripts/
├── setup-git.bat        # Initialize Git repository
├── deploy-nightly.bat   # Trigger nightly deployment
└── start-housegames.bat # Start development server
```

### `public/` - Static Assets

Files served directly (images, icons, etc.).

```
public/
└── manifest.json        # PWA manifest file
```

### `node_modules/` - Dependencies

**Auto-generated** - Contains all npm packages. Don't edit manually!

---

## 📄 File Types Explained

### `.tsx` / `.ts` Files
- **TypeScript/React files** - Application code
- `.tsx` = TypeScript with JSX (React components)
- `.ts` = TypeScript (utilities, configs)

### `.json` Files
- **Configuration data** - Settings, dependencies, etc.

### `.md` Files
- **Markdown documentation** - Readable text files

### `.bat` Files
- **Windows batch scripts** - Automation scripts

### `.toml` Files
- **Configuration files** - Netlify deployment config

---

## 🔍 What Each File Does

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Lists all dependencies and npm scripts |
| `next.config.js` | Next.js build and runtime settings |
| `tsconfig.json` | TypeScript compiler settings |
| `tailwind.config.ts` | Tailwind CSS customization |
| `netlify.toml` | Netlify deployment settings |

### Application Files

| File/Directory | Purpose |
|----------------|---------|
| `app/page.tsx` | Home page |
| `app/layout.tsx` | Root layout (wraps all pages) |
| `app/games/` | All game pages |
| `app/api/` | Server-side API routes |
| `app/components/` | Reusable React components |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project readme |
| `PROJECT_STRUCTURE.md` | This file - explains structure |
| `docs/deployment/DEPLOYMENT.md` | How to deploy |
| `docs/development/SECURITY.md` | Security practices |
| `docs/development/API_KEYS.md` | API keys guide |

### Script Files

| File | Purpose |
|------|---------|
| `scripts/setup-git.bat` | Sets up Git repository |
| `scripts/start-housegames.bat` | Starts dev server |
| `scripts/deploy-nightly.bat` | Triggers deployment |

---

## 🚫 Files You Shouldn't Edit

- `node_modules/` - Auto-generated, don't touch!
- `package-lock.json` - Auto-generated by npm
- `next-env.d.ts` - Auto-generated by Next.js
- `.next/` - Build output (auto-generated)

---

## ✅ Files You Should Edit

- `app/**/*.tsx` - Your application code
- `app/**/*.ts` - Your TypeScript code
- `docs/**/*.md` - Documentation
- Configuration files (when needed)

---

## 📝 Adding New Files

### Adding a New Game

1. Create folder: `app/games/your-game/`
2. Add `page.tsx` inside
3. Game will be accessible at `/games/your-game`

### Adding Documentation

1. Put in appropriate `docs/` subfolder
2. Update `docs/README.md` with link
3. Keep it organized!

### Adding Scripts

1. Put in `scripts/` folder
2. Use `.bat` extension for Windows
3. Document what it does

---

## 🎯 Quick Reference

**Where to find things:**

- **Games**: `app/games/`
- **Documentation**: `docs/`
- **Scripts**: `scripts/`
- **Config**: Root directory
- **Components**: `app/components/`
- **API Routes**: `app/api/`

---

## ❓ Common Questions

**Q: Why are config files in root?**  
A: Next.js, TypeScript, and build tools require them there.

**Q: Can I move `app/` folder?**  
A: No, Next.js requires it in root.

**Q: Where do I add new games?**  
A: `app/games/your-game/page.tsx`

**Q: Where is documentation?**  
A: `docs/` folder - see `docs/README.md` for index.

**Q: What's in `docs/archive/`?**  
A: Old documentation consolidated into new organized docs.

**Q: What's in `docs/personal/`?**  
A: Personal files like resumes (not needed for the project).

---

## 📚 Learn More

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

**This structure keeps everything organized and easy to find!** 🎉








