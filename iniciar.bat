@echo off
title Control de Gastos del Hogar - Servidor Local
color 0B

echo ===================================================
echo     Control de Gastos del Hogar - Servidor Local
echo ===================================================
echo.

:: Verificar si Node.js esta instalado usando sintaxis clasica de errorlevel
node -v >nul 2>&1
if errorlevel 1 goto NO_NODE

:: Verificar si existe la carpeta node_modules
if not exist node_modules goto INSTALL_DEPS

:START_SERVER
echo [INFO] Iniciando el servidor de desarrollo local...
echo Intentando abrir el navegador automaticamente en http://localhost:3000 ...
echo.
:: Abrir el navegador por defecto automaticamente
start http://localhost:3000
echo.
echo Presione Ctrl + C en esta ventana de comando para detener el servidor.
echo ---------------------------------------------------
echo.

call npm run dev
if errorlevel 1 goto ERROR_RUN
goto END

:INSTALL_DEPS
echo [INFO] No se encontro la carpeta "node_modules".
echo Instalando dependencias necesarias. Esto puede tardar unos minutos...
echo.
call npm install
if errorlevel 1 goto ERROR_INSTALL
echo.
echo [OK] Dependencias instaladas con exito.
echo.
goto START_SERVER

:NO_NODE
color 0C
echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH de su sistema.
echo.
echo Para solucionar esto:
echo 1. Descargue e instale Node.js desde: https://nodejs.org/
echo 2. Reinicie su computadora o cierre y vuelva a abrir esta ventana.
echo.
pause
exit /b

:ERROR_INSTALL
color 0C
echo [ERROR] Ocurrio un error al ejecutar "npm install".
echo Por favor, intente abrir una consola de comandos (cmd.exe) como administrador
echo en esta carpeta y ejecute: npm install
echo.
pause
exit /b

:ERROR_RUN
color 0C
echo [ERROR] No se pudo iniciar el servidor de desarrollo.
echo Verifique que no haya otra aplicacion usando el puerto 3000.
echo.
pause
exit /b

:END
pause
