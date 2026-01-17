
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // هذا السطر يضمن أن الروابط تعمل بشكل صحيح عند الرفع على GitHub
});
