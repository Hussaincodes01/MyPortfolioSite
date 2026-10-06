// Copies the static site (index.html + audio/) into dist/ for Vercel and GitHub Pages.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('index.html', 'dist/index.html');
cpSync('audio', 'dist/audio', { recursive: true });
console.log('dist/ ready');
