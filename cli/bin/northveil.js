#!/usr/bin/env node

/**
 * Northveil CLI Executable Entrypoint
 * Copyright (c) 2026 Northveil Protocol
 */

const path = require('path');
const distPath = path.join(__dirname, '..', 'dist', 'index.js');

try {
  require(distPath);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('dist')) {
    console.error('\n[ERROR] Northveil CLI distribution not compiled.');
    console.error('Please run: npm run build (or npx tsc) inside the CLI package directory.\n');
    process.exit(1);
  }
  throw err;
}
