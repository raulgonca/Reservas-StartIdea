import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function UserList() {
    const { users } = usePage().props;

    return (
        <>
            <Head title="Lista de Usuarios" />
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-bold mb-6">Lista de Usuarios</h1>
                <Link href={route('superadmin.users.create')} className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white">
                    Crear Usuario
                </Link>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">Nombre</th>
                            <th className="py-2">Email</th>
                            <th className="py-2">Teléfono</th>
                            <th className="py-2">DNI</th>
                            <th className="py-2">Rol</th>
                            <th className="py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="py-2">{user.name}</td>
                                <td className="py-2">{user.email}</td>
                                <td className="py-2">{user.phone}</td>
                                <td className="py-2">{user.dni}</td>
                                <td className="py-2">{user.role}</td>
                                <td className="py-2">
                                    <Link href={route('superadmin.users.edit', user.id)} className="px-4 py-2 bg-yellow-500 text-white">
                                        Editar
                                    </Link>
                                    <Link href={route('superadmin.users.destroy', user.id)} method="delete" as="button" className="ml-2 px-4 py-2 bg-red-600 text-white">
                                        Eliminar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}