import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo a la izquierda */}
                        <div className="flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                            </Link>
                        </div>

                        {/* Enlaces en el centro */}
                        <div className="hidden space-x-8 sm:flex sm:justify-center sm:flex-1">
                            <NavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                Panel de Control
                            </NavLink>
                            {user.role === 'admin' && (
                                <>
                                    <NavLink
                                        href={route('admin.reservas.index')}
                                        active={route().current('admin.reservas.index')}
                                    >
                                        Reservas
                                    </NavLink>

                                    <NavLink
                                        href={route('admin.reservas.index')}
                                        active={route().current('admin.reservas.index')}
                                    >
                                        Espacios
                                    </NavLink>
                                    {/* Otros enlaces específicos para administradores */}
                                </>
                            )}
                            {user.role === 'superadmin' && (
                                <>
                                    <NavLink
                                        href={route('superadmin.reservas.index')}
                                        active={route().current('superadmin.reservas.index')}
                                    >
                                        Reservas
                                    </NavLink>

                                    <NavLink
                                        href={route('superadmin.reservas.index')}
                                        active={route().current('superadmin.reservas.index')}
                                    >
                                        Usuarios
                                    </NavLink>

                                    <NavLink
                                        href={route('superadmin.reservas.index')}
                                        active={route().current('superadmin.reservas.index')}
                                    >
                                        Espacios
                                    </NavLink>
                                    {/* Otros enlaces específicos para superadministradores */}
                                </>
                            )}
                            {user.role === 'user' && (
                                <>
                                    <NavLink
                                        href={route('user.reservas.index')}
                                        active={route().current('user.reservas.index')}
                                    >
                                        Mis Reservas
                                    </NavLink>
                                    {/* Otros enlaces específicos para usuarios */}
                                </>
                            )}
                        </div>

                        {/* Menú a la derecha */}
                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Botón de menú para móviles */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className="hidden"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>

                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Panel de Control
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('admin.reservas.index')}
                                    active={route().current('admin.reservas.index')}
                                >
                                    Reservas
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('admin.reservas.index')}
                                    active={route().current('admin.reservas.index')}
                                >
                                    Espacios
                                </ResponsiveNavLink>
                                {/* Otros enlaces específicos para administradores */}
                            </>
                        )}
                        {user.role === 'superadmin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('superadmin.reservas.index')}
                                    active={route().current('superadmin.reservas.index')}
                                >
                                    Reservas
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('superadmin.reservas.index')}
                                    active={route().current('superadmin.reservas.index')}
                                >
                                    Usuarios
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('superadmin.reservas.index')}
                                    active={route().current('superadmin.reservas.index')}
                                >
                                    Espacios
                                </ResponsiveNavLink>
                                {/* Otros enlaces específicos para superadministradores */}
                            </>
                        )}
                        {user.role === 'user' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('user.reservas.index')}
                                    active={route().current('user.reservas.index')}
                                >
                                    Mis Reservas
                                </ResponsiveNavLink>
                                {/* Otros enlaces específicos para usuarios */}
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}