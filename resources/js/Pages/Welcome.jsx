import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Reservas" />
            <div className="flex flex-col min-h-screen bg-gray-50 text-white">
                <header className="bg-gray-800 w-full flex items-center justify-between px-6">
                    <div className="flex items-center">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </div>
                    <nav className="flex space-x-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-white hover:text-gray-300"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-white hover:text-gray-300"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-white hover:text-gray-300"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex-grow bg-slate-500 flex items-center justify-center">
                    <h1>Bienvenido</h1>
                </main>

                <footer className="bg-gray-800 w-full py-4 text-center text-sm">
                    Laravel v{laravelVersion} (PHP v{phpVersion})
                </footer>
            </div>
        </>
    );
}