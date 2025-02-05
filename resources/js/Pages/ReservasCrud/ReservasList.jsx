import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ReservasList() {
    const { reservas } = usePage().props;

    return (
        <>
            <Head title="Lista de Reservas" />
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-2xl font-bold mb-6">Lista de Reservas</h1>
                <Link href={route('superadmin.reservas.create')} className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white">
                    Crear Reserva
                </Link>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">Usuario</th>
                            <th className="py-2">Espacio</th>
                            <th className="py-2">Escritorio</th>
                            <th className="py-2">Fecha Inicio</th>
                            <th className="py-2">Fecha Fin</th>
                            <th className="py-2">Hora Inicio</th>
                            <th className="py-2">Hora Fin</th>
                            <th className="py-2">Tipo de Reserva</th>
                            <th className="py-2">Motivo</th>
                            <th className="py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map((reserva) => (
                            <tr key={reserva.id}>
                                <td className="py-2">{reserva.user.name}</td>
                                <td className="py-2">{reserva.espacio.nombre}</td>
                                <td className="py-2">{reserva.escritorio ? reserva.escritorio.nombre : 'N/A'}</td>
                                <td className="py-2">{reserva.fecha_inicio}</td>
                                <td className="py-2">{reserva.fecha_fin || 'N/A'}</td>
                                <td className="py-2">{reserva.hora_inicio || 'N/A'}</td>
                                <td className="py-2">{reserva.hora_fin || 'N/A'}</td>
                                <td className="py-2">{reserva.tipo_reserva}</td>
                                <td className="py-2">{reserva.motivo || 'N/A'}</td>
                                <td className="py-2">
                                    <Link href={route('superadmin.reservas.edit', reserva.id)} className="px-4 py-2 bg-yellow-500 text-white">
                                        Editar
                                    </Link>
                                    <Link href={route('superadmin.reservas.destroy', reserva.id)} method="delete" as="button" className="ml-2 px-4 py-2 bg-red-600 text-white">
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