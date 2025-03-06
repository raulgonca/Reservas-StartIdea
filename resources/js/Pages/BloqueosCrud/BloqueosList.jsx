import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';

export default function BloqueosList({ bloqueos }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bloqueoToDelete, setBloqueoToDelete] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Lógica de filtrado - mantener igual
    const filteredBloqueos = useMemo(() => {
        if (filterType === 'all' && !searchTerm) return bloqueos;
        
        return bloqueos.filter(bloqueo => {
            // Filtrado por texto
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchesSearch = 
                    (bloqueo.espacio?.nombre?.toLowerCase().includes(term)) ||
                    (bloqueo.escritorio?.nombre?.toLowerCase().includes(term)) ||
                    bloqueo.motivo?.toLowerCase().includes(term) ||
                    (bloqueo.creadoPor?.name?.toLowerCase().includes(term));
                
                if (!matchesSearch) return false;
            }
            
            // Filtrado por fechas
            if (filterType === 'date' && (startDate || endDate)) {
                const bloqueoStart = new Date(bloqueo.fecha_inicio);
                const bloqueoEnd = new Date(bloqueo.fecha_fin);
                const filterStart = startDate ? new Date(startDate) : null;
                const filterEnd = endDate ? new Date(endDate) : null;
                
                if (filterStart && bloqueoStart < filterStart) return false;
                if (filterEnd && bloqueoEnd > filterEnd) return false;
            }
            
            return true;
        });
    }, [bloqueos, searchTerm, filterType, startDate, endDate]);

    // Funciones de formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleTimeString('es-ES', options);
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

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Bloqueos" />

            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-4xl font-bold mb-10 text-indigo-700 text-center mt-10">
                    Gestión de Bloqueos
                </h1>

                {/* Panel de filtros */}
                <div className="mb-10 mt-10 flex flex-wrap justify-around gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                        <InputLabel htmlFor="filterType" value="Filtrar por:" className="text-gray-700 dark:text-gray-300" />
                        <SelectInput
                            id="filterType"
                            value={filterType}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">Todos los campos</option>
                            <option value="date">Rango de Fecha</option>
                        </SelectInput>
                    </div>

                    {filterType === 'all' && (
                        <div className="flex items-center space-x-2">
                            <InputLabel htmlFor="search" value="Buscar:" className="text-gray-700 dark:text-gray-300" />
                            <TextInput
                                id="search"
                                type="text"
                                placeholder="Buscar por espacio, escritorio, motivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    )}

                    {filterType === 'date' && (
                        <>
                            <div className="flex items-center space-x-2">
                                <InputLabel htmlFor="startDate" value="Fecha Inicio:" className="text-gray-700 dark:text-gray-300" />
                                <TextInput
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <InputLabel htmlFor="endDate" value="Fecha Fin:" className="text-gray-700 dark:text-gray-300" />
                                <TextInput
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </>
                    )}

                    <div className="ml-auto">
                        <Link href={`${getRoutePrefix()}/bloqueos/create`}>
                            <PrimaryButton className="text-sm px-3 py-2">
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Crear Bloqueo
                                </span>
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>

                {/* Tabla de bloqueos */}
                <div className="w-full overflow-hidden mt-6">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full table-auto bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-gray-200 dark:bg-gray-700">
                                <tr>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-14">ID</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Espacio</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Escritorio</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">F. Inicio</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-20">H. Inicio</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">F. Fin</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-20">H. Fin</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Motivo</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Creado por</th>
                                    <th className="py-3 px-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800">
                                {filteredBloqueos.length > 0 ? (
                                    filteredBloqueos.map(bloqueo => (
                                        <tr key={bloqueo.id} className="border-b last:border-none dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{bloqueo.id}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                <div className="truncate">{bloqueo.espacio?.nombre || 'N/A'}</div>
                                            </td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                {bloqueo.escritorio?.nombre || 'Todo el espacio'}
                                            </td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatDate(bloqueo.fecha_inicio)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatTime(bloqueo.fecha_inicio)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatDate(bloqueo.fecha_fin)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">{formatTime(bloqueo.fecha_fin)}</td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                <div className="truncate max-w-[150px]">{bloqueo.motivo}</div>
                                            </td>
                                            <td className="py-2 px-2 text-xs text-gray-700 dark:text-gray-300">
                                                <div className="truncate">{bloqueo.creadoPor?.name || 'N/A'}</div>
                                            </td>
                                            <td className="py-2 px-2">
                                                <div className="flex space-x-1">
                                                    <Link href={`${getRoutePrefix()}/bloqueos/${bloqueo.id}/edit`}>
                                                        <PrimaryButton className="text-xs px-2 py-1">
                                                            Editar
                                                        </PrimaryButton>
                                                    </Link>
                                                    <DangerButton 
                                                        onClick={() => confirmDelete(bloqueo)}
                                                        className="text-xs px-2 py-1"
                                                    >
                                                        Eliminar
                                                    </DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-6 px-2 text-center text-gray-500 dark:text-gray-400">
                                            No hay bloqueos que coincidan con los criterios de búsqueda
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Confirmar eliminación</h3>
                    <div className="my-4">
                        <p className="text-gray-700 dark:text-gray-300">¿Está seguro que desea eliminar este bloqueo?</p>
                        {bloqueoToDelete && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <p className="text-sm"><span className="font-semibold">Espacio:</span> {bloqueoToDelete.espacio?.nombre}</p>
                                {bloqueoToDelete.escritorio?.nombre && (
                                    <p className="text-sm"><span className="font-semibold">Escritorio:</span> {bloqueoToDelete.escritorio.nombre}</p>
                                )}
                                <p className="text-sm"><span className="font-semibold">Fecha inicio:</span> {formatDate(bloqueoToDelete.fecha_inicio)} {formatTime(bloqueoToDelete.fecha_inicio)}</p>
                                <p className="text-sm"><span className="font-semibold">Fecha fin:</span> {formatDate(bloqueoToDelete.fecha_fin)} {formatTime(bloqueoToDelete.fecha_fin)}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="text-sm">
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} className="text-sm">
                            Confirmar Eliminación
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}