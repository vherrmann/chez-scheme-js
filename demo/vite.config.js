import { defineConfig } from 'vite'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';


export default defineConfig({
    plugins: [
        // other plugins...
        crossOriginIsolation()
    ],
    optimizeDeps: {
        exclude: ['chez-scheme-js']
    },
    server: {
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..'],
        },
    },    
});