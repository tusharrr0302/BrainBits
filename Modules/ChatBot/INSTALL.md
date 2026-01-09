# Installation Instructions

## Fix for Dependency Conflict

If you encounter the `ERESOLVE` error with `lucide-react` and React 19, use one of these solutions:

### Solution 1: Use Legacy Peer Deps (Recommended for Quick Fix)

```bash
npm install --legacy-peer-deps
```

This tells npm to use the older dependency resolution algorithm, which is more lenient with peer dependencies.

### Solution 2: Clean Install

```bash
# Remove existing dependencies
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Solution 3: Use npm overrides (Already Added)

The `package.json` now includes overrides for `lucide-react` to work with React 19. Try:

```bash
npm install
```

If that still fails, use Solution 1.

## After Installation

Once dependencies are installed:

1. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

2. Start the backend server:
   ```bash
   npm run server
   ```

3. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Note

The `--legacy-peer-deps` flag is safe to use here because:
- `lucide-react` works fine with React 19 (it's just the peer dependency declaration that's outdated)
- React 19 is backward compatible with React 18 code
- All other dependencies are compatible
