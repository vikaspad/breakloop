@echo off
echo.
echo 🔍  Starting RAG Pipeline Agent...
echo.

cd rag-pipeline
node agent.js

echo.
echo ✓ RAG Pipeline is running on http://localhost:3004
echo.
echo Next steps:
echo 1. Go to BreakLoop UI: http://localhost:5173
echo 2. Click Agents → + Onboard Agent
echo 3. Use settings from TESTING_RAG_PIPELINES.md
echo.
pause
