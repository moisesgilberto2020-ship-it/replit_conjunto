#!/usr/bin/env node

/**
 * Script para iniciar ambos servidores (frontend y backend) simultáneamente
 * Uso: node start-servers.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando servidores Frontend + Backend...\n');

// Iniciar backend Node.js
const backend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

// Iniciar frontend Next.js
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'Espiperlou BDV'),
  stdio: 'pipe',
  shell: true
});

// Manejar salida del backend
backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Manejar salida del frontend
frontend.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
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

console.log('✅ Servidores iniciados. Presiona Ctrl+C para detener ambos.');
