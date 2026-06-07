@echo off
echo ========================================
echo  BreakLoop API Server
echo ========================================

if not exist "apps\api\node_modules" (
  echo [1/3] Installing API dependencies...
  cd apps\api
  call npm install
  cd ..\..
)

if not exist "apps\api\.env" (
  echo [2/3] Creating .env from .env.example...
  copy .env.example apps\api\.env
  echo [!] IMPORTANT: Edit apps\api\.env and set your keys before running!
)

echo [3/3] Starting API server...
cd apps\api
call npx ts-node-dev --respawn --transpile-only src/index.ts
