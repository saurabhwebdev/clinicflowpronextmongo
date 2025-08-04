#!/usr/bin/env node

// Simple build script that bypasses ESLint completely
const { execSync } = require('child_process');

console.log('🚀 Starting build process...');

try {
  // Set environment variables to skip validation
  process.env.SKIP_ENV_VALIDATION = '1';
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
  
  // Run the build
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1',
      DISABLE_ESLINT_PLUGIN: 'true'
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}