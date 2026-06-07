@echo off
echo ========================================
echo  BreakLoop — Install All Dependencies
echo ========================================

echo [1/3] Installing API dependencies...
cd apps\api
call npm install
if errorlevel 1 ( echo [ERROR] API install failed & pause & exit /b 1 )
echo [OK] API dependencies installed

echo [2/3] Generating Prisma client...
call npx prisma generate
echo [OK] Prisma client generated

cd ..\..

echo [3/3] Installing Web dependencies...
cd apps\web
call npm install
if errorlevel 1 ( echo [ERROR] Web install failed & pause & exit /b 1 )
echo [OK] Web dependencies installed

cd ..\..

echo.
echo ========================================
echo  All done! Next steps:
echo  1. Edit apps\api\.env — set JWT_SECRET and ANTHROPIC_API_KEY
echo  2. Start Postgres + Redis (Docker or local)
echo  3. Run: start-all.bat
echo ========================================
pause
