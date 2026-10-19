# Install pnpm Package Manager

Your project requires `pnpm` but it's not installed. Here are your options:

## Option 1: Install pnpm via npm (Recommended)

Open a **new terminal** and run:

```cmd
npm install -g pnpm
```

After installation, verify:

```cmd
pnpm --version
```

Then close and reopen your terminal, and you can run the CI checks.

---

## Option 2: Install via PowerShell (Alternative)

Open **PowerShell as Administrator** and run:

```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

---

## Option 3: Install via Corepack (Node.js 16.13+)

If you have Node.js 16.13 or later, enable Corepack:

```cmd
corepack enable
corepack prepare pnpm@10.22.0 --activate
```

This uses the exact pnpm version specified in your package.json.

---

## After Installing pnpm

Once pnpm is installed, run the CI checks:

```cmd
cd "C:\Users\akachia\Desktop\DRIPS\truthbounty-frontend"

pnpm install --frozen-lockfile
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

Or simply double-click `RUN_CI_CHECKS.bat`.

---

## Why pnpm?

Your project specifies `"packageManager": "pnpm@10.22.0"` in package.json, which means:

1. The lockfile (`pnpm-lock.yaml`) is pnpm-specific
2. npm or yarn will not work correctly with this project
3. pnpm is required for correct dependency resolution

---

## Troubleshooting

### "command not found" after installation

Close and reopen your terminal. Windows needs to refresh the PATH environment variable.

### Permission errors

Run your terminal as Administrator when installing globally.

### Still not working?

Check if pnpm was added to PATH:

```cmd
echo %PATH%
```

Look for an entry containing `pnpm` or `AppData\Local\pnpm`.

---

**Quick Action:** Run this command now:

```cmd
npm install -g pnpm
```

Then close/reopen terminal and run `RUN_CI_CHECKS.bat`.
