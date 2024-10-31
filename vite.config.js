import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

// // vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       input: {
//         // Entry points for your application
//         popup: resolve(__dirname, 'index.html'),
//         contentScript: resolve(__dirname, 'src/contentScript/contentScript.jsx'),
//       },
//       output: {
//         // Output configuration
//         entryFileNames: 'assets/[name].js',
//         chunkFileNames: 'assets/[name]-[hash].js',
//         assetFileNames: 'assets/[name]-[hash][extname]',
//       },
//     },
//   },
// });
