import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmDeleteBloqueo from '@/Components/ConfirmDeleteBloqueo';

export default function BloqueosTable({ bloqueos, onDelete }) {
    const { auth } = usePage().props;
    const [bloqueoToDelete, setBloqueoToDelete] = useState(null);

    // Funciones de formateo
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };

    const getRoutePrefix = () => {
        return auth.user.role === 'superadmin' ? '/v1/superadmin' : '/v1/admin';
    };

    // Determinar el estado visual del bloqueo
    const getBloqueoStatus = (bloqueo) => {
        const now = new Date();
        const inicio = new Date(bloqueo.fecha_inicio);
        const fin = new Date(bloqueo.fecha_fin);
        
        if (now < inicio) {
            return { label: "Pendiente", class: "text-yellow-600 px-2 py-1" };
        } else if (now > fin) {
            return { label: "Finalizado", class: "text-gray-600 px-2 py-1" };
        } else {
            return { label: "Activo", class: "text-green-600 px-2 py-1" };
        }
    };

    const handleConfirmDelete = (bloqueo) => {
        setBloqueoToDelete(bloqueo);
    };

    const handleCancelDelete = () => {
        setBloqueoToDelete(null);
    };

    const handleDeleteConfirmed = () => {
        if (onDelete && bloqueoToDelete) {
            onDelete(bloqueoToDelete);
        }
        setBloqueoToDelete(null);
    };

    return (
        <>
            <div className="w-full overflow-hidden mt-6">
                <div className="w-full overflow-x-auto">
                    <table className="w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-14">ID</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Espacio</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">Escritorio</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">F. Inicio</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-20">H. Inicio</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">F. Fin</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-20">H. Fin</th>
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Motivo</th>
                                
                                <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-28">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {bloqueos.length > 0 ? (
                                bloqueos.map((bloqueo) => {
                                    const status = getBloqueoStatus(bloqueo);
                                    return (
                                        <tr key={bloqueo.id} className="border-b last:border-none dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{bloqueo.id}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                <div className="truncate">{bloqueo.espacio?.nombre || 'N/A'}</div>
                                            </td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                {bloqueo.escritorio?.nombre || bloqueo.escritorio?.numero || 'Todo el espacio'}
                                            </td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatDate(bloqueo.fecha_inicio)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatTime(bloqueo.fecha_inicio)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatDate(bloqueo.fecha_fin)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatTime(bloqueo.fecha_fin)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                <div className="truncate">{bloqueo.motivo}</div>
                                            </td>
                                            
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                <div className="flex space-x-1">
                                                    <Link href={`${getRoutePrefix()}/bloqueos/${bloqueo.id}/edit`}>
                                                        <PrimaryButton className="text-xs px-2 py-1">
                                                            Editar
                                                        </PrimaryButton>
                                                    </Link>
                                                    <DangerButton 
                                                        onClick={() => handleConfirmDelete(bloqueo)}
                                                        className="text-xs px-2 py-1"
                                                    >
                                                        Eliminar
                                                    </DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="11" className="py-6 px-2 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron bloqueos que coincidan con los criterios de búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Modal de confirmación de eliminación */}
            {bloqueoToDelete && (
                <ConfirmDeleteBloqueo 
                    bloqueo={bloqueoToDelete}
                    onConfirm={handleDeleteConfirmed}
                    onCancel={handleCancelDelete}
                />
            )}
        </>
    );
}