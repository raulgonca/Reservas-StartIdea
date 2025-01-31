import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function EditUser({ user }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        phone: user.phone || '',
        dni: user.dni || '',
        role: user.role || 'user',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('superadmin.users.update', user.id));
    };

    return (
        <>
            <Head title="Editar Usuario" />
            <div className="max-w-2xl mx-auto py-12">
                <h1 className="text-2xl font-bold mb-6">Editar Usuario</h1>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.name && <div className="text-red-600">{errors.name}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.email && <div className="text-red-600">{errors.email}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.password && <div className="text-red-600">{errors.password}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.phone && <div className="text-red-600">{errors.phone}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">DNI</label>
                        <input
                            type="text"
                            value={data.dni}
                            onChange={(e) => setData('dni', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.dni && <div className="text-red-600">{errors.dni}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                            <option value="superadmin">Superadministrador</option>
                        </select>
                        {errors.role && <div className="text-red-600">{errors.role}</div>}
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white" disabled={processing}>
                            Actualizar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}