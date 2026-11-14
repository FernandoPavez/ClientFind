@echo off
title ClientFind
cd /d "%~dp0"

if not exist "server.js" goto sinarchivos
where node >nul 2>nul
if errorlevel 1 goto sinnode

echo.
echo   Iniciando ClientFind...
echo   No cierres esta ventana mientras uses la app.
echo.
node server.js
echo.
echo   La app se detuvo. Si aparece un error arriba, copialo y envialo.
pause
exit /b

:sinnode
echo.
echo   No se encontro Node.js en este computador.
echo   Instala la version LTS desde https://nodejs.org
echo   Despues de instalarlo, reinicia el PC y vuelve a abrir este archivo.
echo.
pause
exit /b

:sinarchivos
echo.
echo   No encuentro server.js junto a este archivo.
echo   Primero descomprime el ZIP: clic derecho sobre radar-clientes.zip, luego "Extraer todo",
echo   y abre iniciar-windows.bat desde la carpeta extraida.
echo.
pause
exit /b
