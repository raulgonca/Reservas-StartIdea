import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';

export default function BloqueosList({ bloqueos }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bloqueoToDelete, setBloqueoToDelete] = useState(null);

    const filteredBloqueos = useMemo(() => {
        if (!searchTerm) return bloqueos;
        
        const term = searchTerm.toLowerCase();
        return bloqueos.filter(bloqueo => 
            (bloqueo.espacio?.nombre?.toLowerCase().includes(term)) ||
            (bloqueo.escritorio?.nombre?.toLowerCase().includes(term)) ||
            bloqueo.motivo?.toLowerCase().includes(term) ||
            (bloqueo.creado_por_user?.name?.toLowerCase().includes(term))
        );
    }, [bloqueos, searchTerm]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    const confirmDelete = (bloqueo) => {
        setBloqueoToDelete(bloqueo);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (!bloqueoToDelete) return;

        const baseUrl = auth.user.role === 'superadmin' 
            ? '/v1/superadmin/bloqueos/' 
            : '/v1/admin/bloqueos/';

        axios.delete(`${baseUrl}${bloqueoToDelete.id}`)
            .then(() => {
                setShowDeleteModal(false);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error al eliminar el bloqueo:', error);
                setShowDeleteModal(false);
            });
    };

    const getRoutePrefix = () => {
        return auth.user.role === 'superadmin' ? '/v1/superadmin' : '/v1/admin';
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestión de Bloqueos</h2>}
        >
            <Head title="Gestión de Bloqueos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <TextInput
                                        type="text"
                                        placeholder="Buscar bloqueos..."
                                        className="w-full md:w-80"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Link href={`${getRoutePrefix()}/bloqueos/create`}>
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Crear Bloqueo
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Espacio</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escritorio</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado por</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBloqueos.length > 0 ? (
                                            filteredBloqueos.map(bloqueo => (
                                                <tr key={bloqueo.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bloqueo.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {bloqueo.espacio?.nombre || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {bloqueo.escritorio?.nombre || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(bloqueo.fecha_inicio)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(bloqueo.fecha_fin)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div className="max-w-xs truncate">{bloqueo.motivo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {bloqueo.creadoPor?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link href={`${getRoutePrefix()}/bloqueos/${bloqueo.id}/edit`}>
                                                                <SecondaryButton>
                                                                    Editar
                                                                </SecondaryButton>
                                                            </Link>
                                                            <DangerButton onClick={() => confirmDelete(bloqueo)}>
                                                                Eliminar
                                                            </DangerButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No hay bloqueos disponibles
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
                    <p className="mb-4">¿Está seguro que desea eliminar este bloqueo?</p>
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
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