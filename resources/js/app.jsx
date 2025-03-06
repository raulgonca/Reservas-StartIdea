import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importar todos los componentes de BloqueosCrud directamente para asegurar carga
import * as BloqueosCrud from './Pages/BloqueosCrud';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

// Personalizar el resolvedor de componentes para manejar errores
const customResolveComponent = (name) => {
    // Verificar si es un componente de BloqueosCrud
    if (name.startsWith('BloqueosCrud/')) {
        const componentName = name.split('/')[1];
        return Promise.resolve(BloqueosCrud[componentName]);
    }
    
    // Resolver de manera normal
    return resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx'));
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: customResolveComponent,
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});