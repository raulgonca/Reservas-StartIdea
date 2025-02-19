import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center dark:bg-gray-900">
            {/* Botón Volver - Posicionado en la esquina superior izquierda */}
            <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Volver
                </Link>
            </div>

            {/* Logo */}
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            {/* Contenedor del formulario */}
            <div className="mx-4 mt-6 w-[calc(100%-2rem)] overflow-hidden bg-white px-6 py-4 shadow-md sm:mx-auto sm:w-full sm:max-w-md rounded-lg dark:bg-gray-800">
                {children}
            </div>
        </div>
    );
}