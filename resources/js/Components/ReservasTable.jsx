import React from 'react';
import { router, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ReservasTable({ reservas, onDelete }) {
    // Obtener los datos de autenticación usando el hook usePage
    const { auth } = usePage().props;

    // Función para formatear fechas al formato español
    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Función para formatear horas al formato español
    const formatTime = (dateString) => {
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleTimeString('es-ES', options);
    };

    // Función para asignar clases de color según el estado de la reserva
    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmada':
                return 'text-green-600  px-2 py-1 '; // Verde para confirmada
            case 'pendiente':
                return 'text-yellow-600  px-2 py-1 '; // Amarillo para pendiente
            case 'cancelada':
                return 'text-red-600  px-2 py-1 '; // Rojo para cancelada
            default:
                return 'text-gray-600  px-2 py-1 '; // Gris para otros estados
        }
    };

    // Función para manejar la edición de reservas según el rol
    const handleEdit = (reserva) => {
        // Determinar el prefijo de la ruta según el rol del usuario
        const prefix = auth.user.role === 'admin' ? 'admin' : 'superadmin';
        router.visit(route(`${prefix}.reservas.edit`, reserva.id));
    };

    // Función para verificar si el usuario puede gestionar reservas
    const canManageReserva = () => {
        return ['admin', 'superadmin'].includes(auth.user.role);
    };

    // Función para obtener el texto descriptivo del tipo de reserva
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
        <div className="w-full overflow-hidden mt-6">
            <div className="w-full overflow-x-auto">
                <table className="w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
                    {/* Encabezado de la tabla */}
                    <thead className="bg-gray-200 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-14">ID</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-32">Usuario</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-28">Espacio</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">Escritorio</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">F. Inicio</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-20">H. Inicio</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">F. Fin</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-20">H. Fin</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">Tipo</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">Estado</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-28">Acciones</th>
                        </tr>
                    </thead>
                    {/* Cuerpo de la tabla */}
                    <tbody className="bg-white dark:bg-gray-800">
                        {reservas.length === 0 ? (
                            // Mensaje cuando no hay reservas
                            <tr>
                                <td colSpan="11" className="py-6 px-2 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron reservas
                                </td>
                            </tr>
                        ) : (
                            // Mapeo de las reservas existentes
                            reservas.map((reserva) => (
                                <tr key={reserva.id} className="border-b last:border-none dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{reserva.id}</td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                        <div className="truncate">{reserva.user.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{reserva.user.email}</div>
                                    </td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300 truncate">{reserva.espacio.nombre}</td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                        {reserva.espacio.tipo === 'coworking' ? 
                                            (reserva.escritorio?.numero || 'Sin asignar') : 
                                            'N/A'}
                                    </td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatDate(reserva.fecha_inicio)}</td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatTime(reserva.fecha_inicio)}</td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatDate(reserva.fecha_fin)}</td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatTime(reserva.fecha_fin)}</td>
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                        {getTipoReservaText(reserva.tipo_reserva)}
                                    </td>
                                    <td className="py-2 px-2">
                                        <span className={`text-xs font-medium ${getStatusClass(reserva.estado)}`}>
                                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                        </span>
                                    </td>
                                    {/* Botones de acción condicionados por el rol del usuario */}
                                    <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                        {canManageReserva() && (
                                            <div className="flex space-x-1">
                                                <PrimaryButton
                                                    onClick={() => handleEdit(reserva)}
                                                    className="text-xs px-2 py-1"
                                                >
                                                    Editar
                                                </PrimaryButton>
                                                <DangerButton
                                                    onClick={() => onDelete(reserva)}
                                                    className="text-xs px-2 py-1"
                                                >
                                                    Eliminar
                                                </DangerButton>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}