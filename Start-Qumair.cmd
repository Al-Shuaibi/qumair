@echo off
cd /d "%~dp0"
set "QUMAIR_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo Open this address in Edge or Chrome: http://127.0.0.1:8767/
echo Keep this window open while using Qumair.
if exist "%QUMAIR_NODE%" (
  "%QUMAIR_NODE%" server.cjs
) else (
  node server.cjs
)
pause
