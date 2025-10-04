#!/usr/bin/env node

/**
 * Script robusto para iniciar la aplicación completa
 * Maneja automáticamente conflictos de puertos y dependencias
 */

import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 BDV - Iniciando Aplicación Completa...\n');

async function killExistingProcesses() {
  try {
    console.log('🧹 Limpiando procesos existentes...');
    await execAsync('taskkill /f /im node.exe 2>nul');
    console.log('✅ Procesos limpiados\n');
  } catch (error) {
    console.log('ℹ️  No hay procesos Node.js ejecutándose\n');
  }
}

async function checkPorts() {
  try {
    const { stdout } = await execAsync('netstat -ano | findstr ":3000\\|:3001"');
    if (stdout) {
      console.log('⚠️  Puertos ocupados detectados, liberando...');
      await killExistingProcesses();
    }
  } catch (error) {
    // No hay puertos ocupados
  }
}

async function installDependencies() {
  try {
    console.log('📦 Verificando dependencias...');
    await execAsync('npm run install:all');
    console.log('✅ Dependencias verificadas\n');
  } catch (error) {
    console.log('❌ Error instalando dependencias:', error.message);
    process.exit(1);
  }
}

async function startServers() {
  console.log('🌟 Iniciando servidores...\n');
  console.log('Frontend: http://localhost:3000');
  console.log('Backend:  http://localhost:3001\n');
  console.log('Presiona Ctrl+C para detener ambos servidores\n');

  const backend = spawn('npm', ['run', 'dev:backend'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });

  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });

  // Manejar salida del backend
  backend.stdout.on('data', (data) => {
    console.log(`[BACKEND] ${data.toString().trim()}`);
  });

  backend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (!output.includes('EADDRINUSE')) {
      console.error(`[BACKEND ERROR] ${output}`);
    }
  });

  // Manejar salida del frontend
  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (!output.includes('Warning')) {
      console.error(`[FRONTEND ERROR] ${output}`);
    }
  });

  // Manejar cierre de procesos
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidores...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidores...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  });
}

async function main() {
  try {
    await killExistingProcesses();
    await checkPorts();
    await installDependencies();
    await startServers();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();


