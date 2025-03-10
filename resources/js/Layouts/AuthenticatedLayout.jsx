import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import DropdownMenu from "@/Components/DropdownMenu";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { HomeIcon } from '@heroicons/react/24/outline';
import FlashMessage from "@/Components/FlashMessage";

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
                            <Link 
                                href="/" 
                                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                title="Ir al inicio"
                            >
                                <HomeIcon className="ml-10 h-10 w-10" />
                            </Link>
                        </div>

                        {/* Enlaces en el centro */}
                        <div className="hidden space-x-8 lg:flex lg:justify-center lg:flex-1">
                            <NavLink
                                href={route("dashboard")}
                                active={route().current("dashboard")}
                            >
                                Panel de Control
                            </NavLink>
                            {user.role === "admin" && (
                                <>
                                    <DropdownMenu
                                        title="Reservas"
                                        links={[
                                            {
                                                href: route("admin.reservas.create"),
                                                label: "Crear Reserva",
                                                active: route().current("admin.reservas.create"),
                                            },
                                            {
                                                href: route("admin.reservas.index"),
                                                label: "Listar Reservas",
                                                active: route().current("admin.reservas.index"),
                                            },
                                            // Otros enlaces relacionados con reservas
                                        ]}
                                    />
                                    {/* NUEVO: Menú de Usuarios para admin */}
                                    <DropdownMenu
                                        title="Usuarios"
                                        links={[
                                            {
                                                href: route("admin.users.create"),
                                                label: "Crear Usuario",
                                                active: route().current("admin.users.create"),
                                            },
                                            {
                                                href: route("admin.users.index"),
                                                label: "Listar Usuarios",
                                                active: route().current("admin.users.index"),
                                            },
                                        ]}
                                    />
                                    <DropdownMenu
                                        title="Espacios"
                                        links={[
                                            {
                                                href: route("admin.espacios.create"),
                                                label: "Crear Espacio",
                                                active: route().current("admin.espacios.create"),
                                            },
                                            {
                                                href: route("admin.espacios.index"),
                                                label: "Listar Espacios",
                                                active: route().current("admin.espacios.index"),
                                            },
                                            // Otros enlaces relacionados con espacios
                                        ]}
                                    />
                                    <DropdownMenu
                                        title="Bloqueos"
                                        links={[
                                            {
                                                href: route("admin.bloqueos.create"),
                                                label: "Crear Bloqueo",
                                                active: route().current("admin.bloqueos.create"),
                                            },
                                            {
                                                href: route("admin.bloqueos.index"),
                                                label: "Listar Bloqueos",
                                                active: route().current("admin.bloqueos.index"),
                                            },
                                        ]}
                                    />
                                    {/* Otros menús específicos para administradores */}
                                </>
                            )}
                            {user.role === "superadmin" && (
                                <>
                                    <DropdownMenu
                                        title="Reservas"
                                        links={[
                                            {
                                                href: route("superadmin.reservas.create"),
                                                label: "Crear Reserva",
                                                active: route().current("superadmin.reservas.create"),
                                            },
                                            {
                                                href: route("superadmin.reservas.index"),
                                                label: "Listar Reservas",
                                                active: route().current("superadmin.reservas.index"),
                                            },
                                            // Otros enlaces relacionados con reservas
                                        ]}
                                    />
                                    <DropdownMenu
                                        title="Usuarios"
                                        links={[
                                            {
                                                href: route("superadmin.users.create"),
                                                label: "Crear Usuario",
                                                active: route().current("superadmin.users.create"),
                                            },
                                            {
                                                href: route("superadmin.users.index"),
                                                label: "Listar Usuarios",
                                                active: route().current("superadmin.users.index"),
                                            },
                                            // Otros enlaces relacionados con usuarios
                                        ]}
                                    />
                                    <DropdownMenu
                                        title="Espacios"
                                        links={[
                                            {
                                                href: route("superadmin.espacios.create"),
                                                label: "Crear Espacio",
                                                active: route().current("superadmin.espacios.create"),
                                            },
                                            {
                                                href: route("superadmin.espacios.index"),
                                                label: "Listar Espacios",
                                                active: route().current("superadmin.espacios.index"),
                                            },
                                            // Otros enlaces relacionados con espacios
                                        ]}
                                    />
                                    <DropdownMenu
                                        title="Bloqueos"
                                        links={[
                                            {
                                                href: route("superadmin.bloqueos.create"),
                                                label: "Crear Bloqueo",
                                                active: route().current("superadmin.bloqueos.create"),
                                            },
                                            {
                                                href: route("superadmin.bloqueos.index"),
                                                label: "Listar Bloqueos",
                                                active: route().current("superadmin.bloqueos.index"),
                                            },
                                        ]}
                                    />
                                    {/* Otros menús específicos para superadministradores */}
                                </>
                            )}
                            {user.role === "user" && (
                                <DropdownMenu
                                    title="Mis Reservas"
                                    links={[
                                        {
                                            href: route("user.reservas.create"),
                                            label: "Crear Reserva",
                                            active: route().current("user.reservas.create"),
                                        },
                                        {
                                            href: route("user.reservas.index"),
                                            label: "Listar Mis Reservas",
                                            active: route().current("user.reservas.index"),
                                        },
                                        // Otros enlaces relacionados con reservas
                                    ]}
                                />
                            )}
                        </div>

                        {/* Menú a la derecha */}
                        <div className="hidden lg:flex lg:items-center">
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
                                        <Dropdown.Link href={route("profile.edit")}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
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
                        <div className="-me-2 flex items-center lg:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
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
                        (showingNavigationDropdown ? "block" : "hidden") + " lg:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                        >
                            Panel de Control
                        </ResponsiveNavLink>
                        {user.role === "admin" && (
                            <>
                                <DropdownMenu
                                    title="Reservas"
                                    links={[
                                        {
                                            href: route("admin.reservas.create"),
                                            label: "Crear Reserva",
                                            active: route().current("admin.reservas.create"),
                                        },
                                        {
                                            href: route("admin.reservas.index"),
                                            label: "Listar Reservas",
                                            active: route().current("admin.reservas.index"),
                                        },
                                    ]}
                                />
                                {/* NUEVO: Menú de Usuarios para admin en versión móvil */}
                                <DropdownMenu
                                    title="Usuarios"
                                    links={[
                                        {
                                            href: route("admin.users.create"),
                                            label: "Crear Usuario",
                                            active: route().current("admin.users.create"),
                                        },
                                        {
                                            href: route("admin.users.index"),
                                            label: "Listar Usuarios",
                                            active: route().current("admin.users.index"),
                                        },
                                    ]}
                                />
                                <DropdownMenu
                                    title="Espacios"
                                    links={[
                                        {
                                            href: route("admin.espacios.create"),
                                            label: "Crear Espacio",
                                            active: route().current("admin.espacios.create"),
                                        },
                                        {
                                            href: route("admin.espacios.index"),
                                            label: "Listar Espacios",
                                            active: route().current("admin.espacios.index"),
                                        },
                                    ]}
                                />
                                <DropdownMenu
                                    title="Bloqueos"
                                    links={[
                                        {
                                            href: route("admin.bloqueos.create"),
                                            label: "Crear Bloqueo",
                                            active: route().current("admin.bloqueos.create"),
                                        },
                                        {
                                            href: route("admin.bloqueos.index"),
                                            label: "Listar Bloqueos",
                                            active: route().current("admin.bloqueos.index"),
                                        },
                                    ]}
                                />
                            </>
                        )}
                        {user.role === "superadmin" && (
                            <>
                                <DropdownMenu
                                    title="Reservas"
                                    links={[
                                        {
                                            href: route("superadmin.reservas.create"),
                                            label: "Crear Reserva",
                                            active: route().current("superadmin.reservas.create"),
                                        },
                                        {
                                            href: route("superadmin.reservas.index"),
                                            label: "Listar Reservas",
                                            active: route().current("superadmin.reservas.index"),
                                        },
                                    ]}
                                />
                                <DropdownMenu
                                    title="Usuarios"
                                    links={[
                                        {
                                            href: route("superadmin.users.create"),
                                            label: "Crear Usuario",
                                            active: route().current("superadmin.users.create"),
                                        },
                                        {
                                            href: route("superadmin.users.index"),
                                            label: "Listar Usuarios",
                                            active: route().current("superadmin.users.index"),
                                        },
                                    ]}
                                />
                                <DropdownMenu
                                    title="Espacios"
                                    links={[
                                        {
                                            href: route("superadmin.espacios.create"),
                                            label: "Crear Espacio",
                                            active: route().current("superadmin.espacios.create"),
                                        },
                                        {
                                            href: route("superadmin.espacios.index"),
                                            label: "Listar Espacios",
                                            active: route().current("superadmin.espacios.index"),
                                        },
                                    ]}
                                />
                                <DropdownMenu
                                    title="Bloqueos"
                                    links={[
                                        {
                                            href: route("superadmin.bloqueos.create"),
                                            label: "Crear Bloqueo",
                                            active: route().current("superadmin.bloqueos.create"),
                                        },
                                        {
                                            href: route("superadmin.bloqueos.index"),
                                            label: "Listar Bloqueos",
                                            active: route().current("superadmin.bloqueos.index"),
                                        },
                                    ]}
                                />
                            </>
                        )}
                        {user.role === "user" && (
                            <DropdownMenu
                                title="Mis Reservas"
                                links={[
                                    {
                                        href: route("user.reservas.create"),
                                        label: "Crear Reserva",
                                        active: route().current("user.reservas.create"),
                                    },
                                    {
                                        href: route("user.reservas.index"),
                                        label: "Listar Mis Reservas",
                                        active: route().current("user.reservas.index"),
                                    },
                                ]}
                            />
                            
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
                            <ResponsiveNavLink href={route("profile.edit")}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
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
                    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="px-2 sm:px-4 lg:px-8">
                <FlashMessage />

                {children}
            </main>
        </div>
    );
}