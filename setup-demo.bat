@echo off
REM Baseline Vanguard Quick Setup Script for Windows

echo 🛡️  Setting up Baseline Vanguard...
echo.

REM Install dependencies  
echo 📦 Installing dependencies...
pnpm install

echo.
echo 🔍 Testing ESLint Plugin (JavaScript):
echo    Checking demo.js for Array.prototype.at() usage...
pnpm demo:lint:js

echo.
echo 🔧 Auto-fixing JavaScript issues...
pnpm demo:fix:js

echo.
echo 🎨 Testing Stylelint Plugin (CSS):
echo    Checking demo.css for :has() selector usage...
pnpm demo:lint:css

echo.
echo 🔧 Auto-fixing CSS issues...
pnpm demo:fix:css

echo.
echo ✅ Baseline Vanguard setup complete!
echo 🎯 Your code is now Baseline-ready!
pause
