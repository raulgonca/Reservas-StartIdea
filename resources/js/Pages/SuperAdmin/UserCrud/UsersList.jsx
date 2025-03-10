import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmDeleteUser from '@/Components/Users/ConfirmDelete';
import TextInput from '@/Components/TextInput';
import useToast from '@/Hooks/useToast';
import { toast } from 'react-toastify';

/**
 * Vista principal para listar y gestionar usuarios
 * 
 * @returns {JSX.Element} Vista de listado de usuarios
 */
export default function UsersList() {
    const { users, auth } = usePage().props;
    
    // Verificar la estructura de datos de users y proporcionar un valor por defecto seguro
    const userData = users?.data || [];
    const usersPagination = {
        total: users?.total || 0,
        from: users?.from || 0,
        to: users?.to || 0,
        links: users?.links || []
    };
    
    // Inicializar el hook de notificaciones automáticas
    useToast();
    
    // Estado para usuario a eliminar
    const [userToDelete, setUserToDelete] = useState(null);
    
    // Estados para filtros y búsqueda
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    
    // Función para aplicar filtro
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        applyFilters(e.target.value, search);
    };
    
    // Función para aplicar búsqueda con debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            applyFilters(filter, value);
        }, 300);
    };
    
    // Función para aplicar filtros y búsqueda
    const applyFilters = (filterValue, searchValue) => {
        router.get(route(`${auth.user.role}.users.index`), {
            filter: filterValue,
            search: searchValue
        }, {
            preserveState: true,
            replace: true,
        });
    };
    
    // Función para mostrar el modal de confirmación de eliminación
    const confirmDelete = (user) => {
        // No permitir eliminar el propio usuario
        if (user.id === auth.user.id) {
            toast.error("No puedes eliminar tu propio usuario");
            return;
        }
        
        // Validar permisos basados en rol
        if (auth.user.role === 'admin' && user.role !== 'user') {
            toast.error("No tienes permisos para eliminar usuarios con rol de administrador");
            return;
        }
        
        setUserToDelete(user);
    };
    
    // Función para cancelar la eliminación
    const cancelDelete = () => {
        setUserToDelete(null);
    };
    
    // Función para eliminar un usuario con notificaciones
    const deleteUser = () => {
        const toastId = toast.loading(`Eliminando usuario ${userToDelete.name}...`);
        
        router.delete(route(`${auth.user.role}.users.destroy`, userToDelete.id), {
            onSuccess: () => {
                setUserToDelete(null);
                toast.update(toastId, {
                    render: `Usuario ${userToDelete.name} eliminado correctamente`,
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors)[0] || "Error al eliminar el usuario";
                toast.update(toastId, {
                    render: errorMessage,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
            }
        });
    };
    
    // Función para obtener la clase CSS del badge según el rol
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'admin':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Usuarios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Cabecera con título y botón de crear */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Gestión de Usuarios
                                </h2>
                                <Link href={route(`${auth.user.role}.users.create`)}>
                                    <PrimaryButton>
                                        Nuevo Usuario
                                    </PrimaryButton>
                                </Link>
                            </div>
                            
                            {/* Filtros y búsqueda */}
                            <div className="mb-6 flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-1/3">
                                    <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Filtrar por rol
                                    </label>
                                    <select
                                        id="filter"
                                        value={filter}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        <option value="all">Todos los roles</option>
                                        {auth.user.role === 'superadmin' && (
                                            <>
                                                <option value="superadmin">Superadministradores</option>
                                                <option value="admin">Administradores</option>
                                            </>
                                        )}
                                        <option value="user">Usuarios estándar</option>
                                    </select>
                                </div>
                                <div className="w-full md:w-2/3">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Buscar
                                    </label>
                                    <TextInput
                                        id="search"
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder="Buscar por nombre, email o DNI..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            
                            {/* Tabla de usuarios */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                DNI
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Teléfono
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Rol
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {userData.length > 0 ? (
                                            userData.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.dni}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                                                            {user.role === 'superadmin' 
                                                                ? 'Superadmin' 
                                                                : user.role === 'admin' 
                                                                    ? 'Administrador' 
                                                                    : 'Usuario'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            {/* No permitir editar o eliminar su propio usuario */}
                                                            {user.id !== auth.user.id ? (
                                                                <>
                                                                    {/* Los admin solo pueden editar usuarios normales */}
                                                                    {(auth.user.role === 'superadmin' || user.role === 'user') && (
                                                                        <Link href={route(`${auth.user.role}.users.edit`, user.id)}>
                                                                            <SecondaryButton>
                                                                                Editar
                                                                            </SecondaryButton>
                                                                        </Link>
                                                                    )}
                                                                    
                                                                    {/* Los admin solo pueden eliminar usuarios normales */}
                                                                    {(auth.user.role === 'superadmin' || user.role === 'user') && (
                                                                        <DangerButton onClick={() => confirmDelete(user)}>
                                                                            Eliminar
                                                                        </DangerButton>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                    Usuario actual
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No se encontraron usuarios con los criterios de búsqueda actuales
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Resumen de resultados y paginación */}
                            {userData.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Mostrando {usersPagination.from || 0} - {usersPagination.to || 0} de {usersPagination.total || 0} usuarios
                                    </div>
                                    
                                    {/* Paginación simple sin depender del componente Pagination */}
                                    {usersPagination.links && usersPagination.links.length > 3 && (
                                        <div className="flex flex-wrap justify-center mt-4 gap-1">
                                            {usersPagination.links.map((link, key) => {
                                                if (link.url === null) {
                                                    return (
                                                        <span
                                                            key={key}
                                                            className="px-4 py-2 text-sm text-gray-500 bg-gray-100 border rounded cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }
                                                
                                                return (
                                                    <Link
                                                        key={key}
                                                        href={link.url}
                                                        className={`px-4 py-2 text-sm border rounded ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-800'
                                                                : 'text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de confirmación de eliminación */}
            {userToDelete && (
                <ConfirmDeleteUser
                    user={userToDelete}
                    onConfirm={deleteUser}
                    onCancel={cancelDelete}
                />
            )}
        </AuthenticatedLayout>
    );
}