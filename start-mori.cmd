@echo off
rem ---------------------------------------------------------------------------
rem MORI AI Growth OS - one-click dev server for Windows
rem
rem 1) If something is already listening on port 3000, just open the browser.
rem 2) Otherwise start the dev server and open http://localhost:3000 after 9s.
rem 3) Uses the system npm when available, otherwise the Codex bundled pnpm.
rem
rem NOTE: keep this window open; closing it stops the server (browser will
rem show "connection refused").
rem (This file is intentionally ASCII-only: cmd.exe decodes .cmd as GBK on
rem  Chinese Windows and non-ASCII comments can break the parser.)
rem ---------------------------------------------------------------------------
setlocal
cd /d "%~dp0"
set NEXT_TELEMETRY_DISABLED=1

rem --- already running? just open the browser ---
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %errorlevel%==0 (
  echo [MORI] service already running - opening browser ...
  start "" http://localhost:3000
  goto :eof
)

echo [MORI] starting MORI AI Growth OS ...
echo [MORI] browser will open automatically at http://localhost:3000 - keep this window open.
start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 9; Start-Process 'http://localhost:3000'"

where npm >nul 2>nul
if %errorlevel%==0 (
  echo [MORI] using system npm ...
  call npm run dev
  goto :eof
)

set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PNPM_CJS=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs"

if not exist "%NODE_EXE%" (
  echo [MORI] Node.js not found. Please install Node.js LTS from https://nodejs.org/ and run: npm install ^&^& npm run db:setup ^&^& npm run dev
  pause
  goto :eof
)

echo [MORI] npm not found - using bundled pnpm runtime ...
echo [MORI] open http://localhost:3000 after "Ready" appears. Press Ctrl+C to stop.
"%NODE_EXE%" "%PNPM_CJS%" exec next dev -p 3000
pause
