import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteEspacio from '@/Components/ConfirmDeleteEspacio';
import { toast } from 'react-toastify';
import PrimaryButton from '@/Components/PrimaryButton';
import EspacioModal from '@/Pages/Admin/Espacios/EspacioModal';

export default function Index({ espacios, filters }) {
    const { auth } = usePage().props;
    const [espacioToDelete, setEspacioToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [tipoFilter, setTipoFilter] = useState(filters?.tipo || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [espacioToEdit, setEspacioToEdit] = useState(null);

    // Función para manejar la eliminación
    const handleDelete = (espacio) => {
        setEspacioToDelete(espacio);
    };

    // Confirmar eliminación
    const confirmDelete = () => {
        const routePrefix = auth.user.role === 'admin' ? 'admin' : 'superadmin';
        
        router.delete(route(`${routePrefix}.espacios.destroy`, espacioToDelete.id), {
            onBefore: () => {
                toast.info("Procesando eliminación...", { 
                    autoClose: false, 
                    toastId: "deleting-espacio" 
                });
                return true;
            },
            onSuccess: () => {
                setEspacioToDelete(null);
                toast.dismiss("deleting-espacio");
                toast.success("Espacio eliminado correctamente", { 
                    toastId: 'delete-success-' + Date.now() 
                });
            },
            onError: (error) => {
                setEspacioToDelete(null);
                toast.dismiss("deleting-espacio");
                toast.error(error.message || "Error al eliminar el espacio", { 
                    toastId: 'delete-error-' + Date.now() 
                });
            }
        });
    };

    // Cancelar la eliminación
    const cancelDelete = () => {
        setEspacioToDelete(null);
    };

    // Toggle estado activo/inactivo
    const toggleActive = (id) => {
        const routePrefix = auth.user.role === 'admin' ? 'admin' : 'superadmin';
        
        router.patch(route(`${routePrefix}.espacios.toggle-active`, id), {}, {
            onSuccess: () => {
                toast.success("Estado del espacio actualizado correctamente");
            },
            onError: () => {
                toast.error("Error al actualizar el estado del espacio");
            }
        });
    };

    // Manejo de búsqueda
    const handleSearch = (e) => {
        e.preventDefault();
        
        const routePrefix = auth.user.role === 'admin' ? 'admin' : 'superadmin';
        
        router.get(route(`${routePrefix}.espacios.index`), {
            search: searchQuery,
            tipo: tipoFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleEdit = (espacio) => {
        setEspacioToEdit(espacio);
        setModalOpen(true);
    };

    const routePrefix = auth.user.role === 'admin' ? 'admin' : 'superadmin';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Gestión de Espacios
                </h2>
            }
        >
            <Head title="Gestión de Espacios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="flex flex-wrap justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Espacios Disponibles
                                </h3>
                                <Link href={route(`${routePrefix}.espacios.create`)}>
                                    <PrimaryButton>
                                        <span className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Crear Espacio
                                        </span>
                                    </PrimaryButton>
                                </Link>
                            </div>

                            {/* Filtros */}
                            <div className="mb-6">
                                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                                    <div className="w-full md:w-1/3">
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Buscar
                                        </label>
                                        <input
                                            type="text"
                                            id="search"
                                            placeholder="Nombre del espacio..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/3">
                                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Espacio
                                        </label>
                                        <select
                                            id="tipo"
                                            value={tipoFilter}
                                            onChange={(e) => setTipoFilter(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">Todos</option>
                                            <option value="sala">Sala</option>
                                            <option value="coworking">Coworking</option>
                                            <option value="radio">Radio</option>
                                            <option value="despacho">Despacho</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <PrimaryButton type="submit">
                                            Filtrar
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>

                            {/* Tabla de espacios */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Aforo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Precio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {espacios.data.length > 0 ? (
                                            espacios.data.map((espacio) => (
                                                <tr key={espacio.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{espacio.nombre}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{espacio.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 capitalize">{espacio.tipo}</div>
                                                        {espacio.tipo === 'coworking' && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {espacio.escritorios?.length || 0} escritorios
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                espacio.is_active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}
                                                        >
                                                            {espacio.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {espacio.aforo || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        ${parseFloat(espacio.price).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleEdit(espacio)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => toggleActive(espacio.id)}
                                                                className={`${
                                                                    espacio.is_active
                                                                        ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                        : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                }`}
                                                            >
                                                                {espacio.is_active ? 'Desactivar' : 'Activar'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(espacio)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No se encontraron espacios
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {espacios.links && (
                                <div className="mt-6">
                                    <Pagination links={espacios.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {espacioToDelete && (
                <ConfirmDeleteEspacio
                    espacio={espacioToDelete}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}

            {/* Modal de edición */}
            {modalOpen && (
                <EspacioModal
                    espacio={espacioToEdit}
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEspacioToEdit(null);
                    }}
                    tipos={['sala', 'coworking', 'radio', 'despacho']}
                />
            )}
        </AuthenticatedLayout>
    );
}