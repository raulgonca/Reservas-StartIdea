import React from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ReservasTable({ reservas, onDelete }) {
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('es-ES', options);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmada':
                return 'text-green-600';
            case 'pendiente':
                return 'text-yellow-600';
            case 'cancelada':
                return 'text-red-600';
            default:
                return '';
        }
    };

    const handleEdit = (reserva) => {
        router.visit(route('superadmin.reservas.edit', reserva.id));
    };

    return (
        <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ID</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Espacio</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Escritorio</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Hora Inicio</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Hora Fin</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Reserva</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Estado</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                    {reservas.map((reserva) => (
                        <tr key={reserva.id} className="border-b last:border-none dark:border-gray-700">
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.user.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.espacio.nombre}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.espacio.tipo === 'coworking' ? reserva.escritorio.nombre : 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(reserva.fecha_inicio)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatTime(reserva.fecha_inicio)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(reserva.fecha_fin)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatTime(reserva.fecha_fin)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.tipo_reserva}</td>
                            <td className={`py-3 px-4 text-sm font-medium ${getStatusClass(reserva.estado)}`}>{reserva.estado}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 flex space-x-2">
                                <PrimaryButton onClick={() => handleEdit(reserva)} className="mr-2">Editar</PrimaryButton>
                                <DangerButton onClick={() => onDelete(reserva)}>Eliminar</DangerButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}