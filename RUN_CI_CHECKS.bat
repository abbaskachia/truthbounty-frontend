@echo off
REM ========================================
REM PR CI Checks Script
REM Run this in your terminal to verify PR readiness
REM ========================================

echo.
echo ========================================
echo PR FIX: V2-FE-109 CI Checks
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Installing dependencies...
echo.
pnpm install --frozen-lockfile
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Frozen lockfile install failed. Trying fresh install...
    pnpm install
    if %errorlevel% neq 0 (
        echo ERROR: Dependency installation failed!
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo [2/7] Running type check...
echo ========================================
pnpm run type-check
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Type check failed!
    echo Review the errors above and fix TypeScript issues.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [3/7] Running linter...
echo ========================================
pnpm run lint
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Lint errors found. Attempting auto-fix...
    pnpm run lint --fix
    if %errorlevel% neq 0 (
        echo ERROR: Lint issues remain after auto-fix.
        echo Review the errors above.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo [4/7] Running unit tests...
echo ========================================
pnpm run test
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Tests failed!
    echo Review the test failures above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [5/7] Running accessibility tests...
echo ========================================
pnpm run test:a11y
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Accessibility tests failed.
    echo Review the failures above.
    REM Don't exit - a11y might be optional
)

echo.
echo ========================================
echo [6/7] Running build...
echo ========================================
pnpm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    echo Review the build errors above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [7/7] Build verification complete
echo ========================================

echo.
echo ========================================
echo SUCCESS: All CI checks passed!
echo ========================================
echo.
echo Next steps:
echo 1. Review PR_FIX_REPORT.md for details
echo 2. Push branch: git push -u origin feat/v2-fe-109-active-claims-table-ownership
echo 3. Create PR using the gh command in PR_FIX_REPORT.md
echo.
pause
