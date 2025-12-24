@echo off
pushd "%~dp0\travel-ops-oups"
if not exist node_modules (
  npm install
)
call npm run dev
set "STATUS=%ERRORLEVEL%"
popd
if not "%STATUS%"=="0" pause
