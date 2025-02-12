import React from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ReservasTable({ reservas, onDelete }) {
    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatTime = (dateString) => {
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleTimeString('es-ES', options);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmada':
                return 'text-green-600  px-2 py-1 ';
            case 'pendiente':
                return 'text-yellow-600  px-2 py-1 ';
            case 'cancelada':
                return 'text-red-600  px-2 py-1 ';
            default:
                return 'text-gray-600  px-2 py-1 ';
        }
    };

    const handleEdit = (reserva) => {
        router.visit(route('superadmin.reservas.edit', reserva.id));
    };

    const getTipoReservaText = (tipo) => {
        const tipos = {
            'hora': 'Por Hora',
            'medio_dia': 'Medio Día',
            'dia_completo': 'Día Completo',
            'semana': 'Semana',
            'mes': 'Mes'
        };
        return tipos[tipo] || tipo;
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
                    {reservas.length === 0 ? (
                        <tr>
                            <td colSpan="11" className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                                No se encontraron reservas
                            </td>
                        </tr>
                    ) : (
                        reservas.map((reserva) => (
                            <tr key={reserva.id} className="border-b last:border-none dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.id}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                    <div>{reserva.user.name}</div>
                                    <div className="text-xs text-gray-500">{reserva.user.email}</div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{reserva.espacio.nombre}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                    {reserva.espacio.tipo === 'coworking' ? 
                                        (reserva.escritorio?.nombre || 'Sin asignar') : 
                                        'N/A'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(reserva.fecha_inicio)}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatTime(reserva.fecha_inicio)}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(reserva.fecha_fin)}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatTime(reserva.fecha_fin)}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                    {getTipoReservaText(reserva.tipo_reserva)}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`text-sm font-medium ${getStatusClass(reserva.estado)}`}>
                                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="flex space-x-2">
                                        <PrimaryButton
                                            onClick={() => handleEdit(reserva)}
                                            className="text-xs px-3 py-1"
                                        >
                                            Editar
                                        </PrimaryButton>
                                        <DangerButton
                                            onClick={() => onDelete(reserva)}
                                            className="text-xs px-3 py-1"
                                        >
                                            Eliminar
                                        </DangerButton>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}