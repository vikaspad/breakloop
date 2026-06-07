@echo off
echo.
echo 🤖  Starting Autonomous Agent Simulator...
echo.

cd autonomous-agent
node agent.js

echo.
echo ✓ Autonomous Agent is running on http://localhost:3003
echo.
echo Next steps:
echo 1. Go to BreakLoop UI: http://localhost:5173
echo 2. Click Agents → + Onboard Agent
echo 3. Follow the guide in TESTING_AUTONOMOUS_AGENTS.md
echo.
pause
