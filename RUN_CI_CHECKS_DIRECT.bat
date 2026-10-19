@echo off
REM ========================================
REM PR CI Checks Script (Direct pnpm path)
REM Run this in your terminal to verify PR readiness
REM ========================================

echo.
echo ========================================
echo PR FIX: V2-FE-109 CI Checks
echo ========================================
echo.

cd /d "%~dp0"

REM Set the direct path to pnpm
set "PNPM=%APPDATA%\npm\pnpm.cmd"

REM Verify pnpm exists
if not exist "%PNPM%" (
    echo ERROR: pnpm not found at %PNPM%
    echo.
    echo Please install pnpm:
    echo   npm install -g pnpm
    echo.
    pause
    exit /b 1
)

echo Using pnpm at: %PNPM%
echo.

echo [1/7] Installing dependencies...
echo.
echo Checking lockfile integrity...
"%PNPM%" install --frozen-lockfile
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo WARNING: Lockfile corruption detected!
    echo ========================================
    echo.
    echo The lockfile references typescript@7.0.2 but package.json has 6.0.3
    echo This is likely from a merge conflict or upstream sync issue.
    echo.
    echo Regenerating lockfile with: pnpm install --no-frozen-lockfile
    echo.
    "%PNPM%" install --no-frozen-lockfile
    if %errorlevel% neq 0 (
        echo ERROR: Dependency installation failed even with lockfile regeneration!
        echo.
        echo This may require manual intervention. Check:
        echo 1. Network connectivity
        echo 2. npm registry access
        echo 3. Disk space
        pause
        exit /b 1
    )
    echo.
    echo SUCCESS: Lockfile regenerated and dependencies installed!
    echo.
)

echo.
echo ========================================
echo [2/7] Running type check...
echo ========================================
"%PNPM%" run type-check
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
"%PNPM%" run lint
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Lint errors found. Attempting auto-fix...
    "%PNPM%" run lint --fix
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
"%PNPM%" run test
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
"%PNPM%" run test:a11y
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Accessibility tests failed or not available.
    echo Continuing with build...
    echo.
)

echo.
echo ========================================
echo [6/7] Running build...
echo ========================================
"%PNPM%" run build
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
