import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function ShowBloqueo({ bloqueo }) {
    const { auth, flash, errors } = usePage().props;
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Mostrar mensajes con toast correctamente usando toastId
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, { toastId: 'success-' + Date.now() });
        }
        
        if (errors.error) {
            toast.error(errors.error, { toastId: 'error-' + Date.now() });
        }
    }, [flash, errors]);

    // Formatear fechas para mejor legibilidad
    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'No especificado';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('es-ES', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    const handleDelete = () => {
        const routePrefix = auth.user.role === 'superadmin' ? 'superadmin' : 'admin';
        
        router.delete(route(`${routePrefix}.bloqueos.destroy`, bloqueo.id), {
            onBefore: () => {
                toast.info('Eliminando bloqueo...', { 
                    autoClose: false, 
                    toastId: 'deleting-show-' + Date.now() 
                });
                return true;
            },
            onSuccess: () => {
                toast.dismiss('deleting-show-' + Date.now());
                toast.success('Bloqueo eliminado correctamente', {
                    toastId: 'success-delete-' + Date.now()
                });
            },
            onError: (errors) => {
                setDeleteModalOpen(false);
                toast.dismiss('deleting-show-' + Date.now());
                toast.error('Error al eliminar el bloqueo: ' + 
                    (errors.error || 'Ocurrió un problema inesperado'), {
                    toastId: 'error-delete-' + Date.now()
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Bloqueo #${bloqueo.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Detalle del bloqueo */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                                    Detalle de Bloqueo #{bloqueo.id}
                                </h2>
                                
                                <div className="flex space-x-2">
                                    <Link 
                                        href={route(`${auth.user.role}.bloqueos.edit`, bloqueo.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Editar
                                    </Link>
                                    
                                    <DangerButton onClick={() => setDeleteModalOpen(true)}>
                                        Eliminar
                                    </DangerButton>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Espacio</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                                            {bloqueo.espacio?.nombre || 'No especificado'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Escritorio</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                                            {bloqueo.escritorio?.numero || 'Todo el espacio'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fechas</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                                            {formatDateTime(bloqueo.fecha_inicio)} - {formatDateTime(bloqueo.fecha_fin)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado por</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                                            {bloqueo.creadoPor?.name || 'No especificado'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Motivo del bloqueo</h3>
                                        <p className="mt-1 text-base text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            {bloqueo.motivo || 'No especificado'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center">
                        <Link 
                            href={route(`${auth.user.role}.bloqueos.index`)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Volver a la lista
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Modal de confirmación */}
            <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Confirmar eliminación
                    </h3>
                    
                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            ¿Está seguro que desea eliminar este bloqueo? Esta acción no se puede deshacer.
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                            <p className="text-sm"><strong>Espacio:</strong> {bloqueo.espacio?.nombre}</p>
                            {bloqueo.escritorio && (
                                <p className="text-sm"><strong>Escritorio:</strong> {bloqueo.escritorio.numero}</p>
                            )}
                            <p className="text-sm"><strong>Período:</strong> {formatDateTime(bloqueo.fecha_inicio)} - {formatDateTime(bloqueo.fecha_fin)}</p>
                            <p className="text-sm"><strong>Motivo:</strong> {bloqueo.motivo}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeleteModalOpen(false)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Eliminar
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
