import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    // Configuración del servidor de desarrollo
    server: {
        // Configuración para el sistema de monitoreo de archivos
        watch: {
            // Patrones de archivos/carpetas que serán ignorados por el watcher
            // Esto evita errores EBADF con archivos multimedia grandes
            ignored: [
                '**/node_modules/**',
                '**/vendor/**',
                '**/storage/app/public/**',  // Carpeta original de archivos
                '**/public/storage/**'       // Enlace simbólico a archivos multimedia
            ]
        }
    },
});