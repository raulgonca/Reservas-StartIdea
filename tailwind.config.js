import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                'montserrat': ['Montserrat', 'sans-serif'],
                'playfair': ['"Playfair Display"', 'serif'],
            },
        },
    },

    // Asegurarse de que los colores para estados estén incluidos
    safelist: [
        // Colores para estados de disponibilidad
        'bg-green-100', 'text-green-800', 'hover:bg-green-200',
        'bg-yellow-50', 'text-yellow-800', 'hover:bg-yellow-100',
        'bg-yellow-100', 'text-yellow-800', 'hover:bg-yellow-200',
        'bg-orange-100', 'text-orange-800', 'hover:bg-orange-200',
        'bg-red-100', 'text-red-800', 'hover:bg-red-200',
        'bg-gray-100', 'text-gray-600', 'hover:bg-gray-200',
    ],

    plugins: [forms],
};