@echo off
echo ========================================
echo  BreakLoop Web UI
echo ========================================

if not exist "apps\web\node_modules" (
  echo [1/2] Installing web dependencies...
  cd apps\web
  call npm install
  cd ..\..
)

echo [2/2] Starting Vite dev server...
cd apps\web
call npx vite
