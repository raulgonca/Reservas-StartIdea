import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function SuperAdminDashboard({ auth }) {
    return (
        <>
            <Head title="Super Admin Dashboard" />
            <div className="flex flex-col min-h-screen bg-gray-50 text-white">
                <header className="bg-gray-800 w-full flex items-center justify-between px-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                    </div>
                    <nav className="flex space-x-4">
                        <Link href={route('superadmin.users.index')} className="text-white hover:text-gray-300">
                            Gestionar Usuarios
                        </Link>
                        <Link href={route('superadmin.reservas.index')} className="text-white hover:text-gray-300">
                            Gestionar Reservas
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="text-white hover:text-gray-300">
                            Logout
                        </Link>
                    </nav>
                </header>

                <main className="flex-grow bg-slate-500 flex items-center justify-center">
                    <h1>Bienvenido, Super Administrador</h1>
                </main>

                <footer className="bg-gray-800 w-full py-4 text-center text-sm">
                    Laravel v{auth.laravelVersion} (PHP v{auth.phpVersion})
                </footer>
            </div>
        </>
    );
}