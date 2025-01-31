import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Reservas" />
            <div className="flex flex-col min-h-screen bg-gray-50 text-white">
                <header className="bg-gray-800 w-full py-4">
                    <nav className="flex justify-end space-x-4 px-6">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-white hover:text-gray-300"
                            >
                                Tablero
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