@echo off
echo ========================================
echo  BreakLoop — Full Stack Startup
echo ========================================

:: Start Docker services (Postgres + Redis)
echo [1/5] Starting Docker services (Postgres + Redis)...
docker-compose up db redis -d
if errorlevel 1 (
  echo [!] Docker not available — make sure Docker Desktop is running or use local Postgres/Redis
  echo     DATABASE_URL and REDIS_URL in .env must point to running instances
)

:: Wait for DB
echo [2/5] Waiting for DB to be ready (5s)...
timeout /t 5 /nobreak >nul

:: Install deps if needed
if not exist "apps\api\node_modules" (
  echo [3a] Installing API dependencies...
  cd apps\api && call npm install && cd ..\..
)
if not exist "apps\web\node_modules" (
  echo [3b] Installing web dependencies...
  cd apps\web && call npm install && cd ..\..
)

:: Copy env if missing
if not exist "apps\api\.env" (
  copy .env.example apps\api\.env
  echo [!] Created apps\api\.env — edit it to set your OPENAI_API_KEY and JWT_SECRET before full use
)

:: Run migrations + seed
echo [4/5] Running DB migrations and seed...
cd apps\api
call npx prisma migrate deploy 2>nul || call npx prisma migrate dev --name init
call npx ts-node src/db/seed.ts
cd ..\..

echo.
echo ========================================
echo  Starting servers in separate windows...
echo ========================================
echo [5/5] Launching API, Web UI, and Sample Agent...
echo.

start "BreakLoop API :3001" cmd /k "cd apps\api && npx ts-node-dev --respawn --transpile-only src/index.ts"
timeout /t 3 /nobreak >nul

start "BreakLoop Web :5173" cmd /k "cd apps\web && npx vite"
timeout /t 1 /nobreak >nul

start "SupportBot Sample Agent :3002" cmd /k "node sample-agent\agent.js"

echo.
echo  API:          http://localhost:3001/health
echo  Web:          http://localhost:5173
echo  Sample Agent: http://localhost:3002/health
echo.
echo  Login: admin@breakloop.dev / password123
echo.
echo  The 'Core Behavior Suite' is pre-configured against SupportBot Pro.
echo  Go to Run Center, select SupportBot Pro + Core Behavior Suite, then Run.
echo.
pause
