import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

/**
 * Componente de filtros avanzados para buscar usuarios
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros actuales
 * @param {string} props.routeName - Nombre de la ruta para aplicar filtros
 * @returns {JSX.Element} Panel de filtros avanzados
 */
export default function UserFilters({ filters = {}, routeName }) {
    // Estado para controlar la visibilidad del panel de filtros
    const [showFilters, setShowFilters] = useState(false);
    
    // Estado local para los filtros (inicializado con los filtros actuales o valores predeterminados)
    const [filterValues, setFilterValues] = useState({
        search: filters.search || '',
        role: filters.role || '',
        sort: filters.sort || 'name',
        direction: filters.direction || 'asc',
        created_after: filters.created_after || '',
        created_before: filters.created_before || ''
    });

    /**
     * Actualiza un valor de filtro específico
     * 
     * @param {string} key - Clave del filtro a actualizar
     * @param {string} value - Nuevo valor
     */
    const handleFilterChange = (key, value) => {
        setFilterValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    /**
     * Aplica los filtros y redirige a la misma ruta con query params
     */
    const applyFilters = () => {
        // Eliminar filtros vacíos para no sobrecargar la URL
        const cleanFilters = Object.entries(filterValues)
            .filter(([_, value]) => value !== '')
            .reduce((obj, [key, value]) => ({
                ...obj,
                [key]: value,
            }), {});
            
        // Usar la API de Inertia para navegar con los filtros como query params
        router.get(route(routeName), cleanFilters, {
            preserveState: true,
            replace: true,
        });
    };

    /**
     * Limpia todos los filtros y restablece la búsqueda
     */
    const resetFilters = () => {
        const emptyFilters = {
            search: '',
            role: '',
            sort: 'name',
            direction: 'asc',
            created_after: '',
            created_before: ''
        };
        
        setFilterValues(emptyFilters);
        
        // Redirigir sin filtros
        router.get(route(routeName), {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="mb-8">
            {/* Botón para mostrar/ocultar filtros */}
            <div className="flex justify-between items-center mb-4">
                <SecondaryButton onClick={() => setShowFilters(!showFilters)} type="button">
                    {showFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
                </SecondaryButton>
                
                {Object.values(filterValues).some(v => v !== '') && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                        Filtros activos
                    </span>
                )}
            </div>
            
            {/* Panel de filtros desplegable */}
            {showFilters && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Filtro por término de búsqueda */}
                        <div>
                            <InputLabel htmlFor="search" value="Búsqueda general" />
                            <TextInput
                                id="search"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="Nombre, email, DNI..."
                                value={filterValues.search}
                                onChange={e => handleFilterChange('search', e.target.value)}
                            />
                        </div>
                        
                        {/* Filtro por rol */}
                        <div>
                            <InputLabel htmlFor="role" value="Rol" />
                            <select
                                id="role"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={filterValues.role}
                                onChange={e => handleFilterChange('role', e.target.value)}
                            >
                                <option value="">Todos los roles</option>
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                                <option value="superadmin">Superadministrador</option>
                            </select>
                        </div>
                        
                        {/* Ordenar por */}
                        <div>
                            <InputLabel htmlFor="sort" value="Ordenar por" />
                            <div className="flex space-x-2">
                                <select
                                    id="sort"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    value={filterValues.sort}
                                    onChange={e => handleFilterChange('sort', e.target.value)}
                                >
                                    <option value="name">Nombre</option>
                                    <option value="email">Email</option>
                                    <option value="created_at">Fecha de registro</option>
                                </select>
                                
                                <select
                                    id="direction"
                                    className="mt-1 block w-32 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    value={filterValues.direction}
                                    onChange={e => handleFilterChange('direction', e.target.value)}
                                >
                                    <option value="asc">Ascendente</option>
                                    <option value="desc">Descendente</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Filtro por fecha de creación - Desde */}
                        <div>
                            <InputLabel htmlFor="created_after" value="Registrado después de" />
                            <TextInput
                                id="created_after"
                                type="date"
                                className="mt-1 block w-full"
                                value={filterValues.created_after}
                                onChange={e => handleFilterChange('created_after', e.target.value)}
                            />
                        </div>
                        
                        {/* Filtro por fecha de creación - Hasta */}
                        <div>
                            <InputLabel htmlFor="created_before" value="Registrado antes de" />
                            <TextInput
                                id="created_before"
                                type="date"
                                className="mt-1 block w-full"
                                value={filterValues.created_before}
                                onChange={e => handleFilterChange('created_before', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Botones para aplicar/limpiar filtros */}
                    <div className="flex justify-end space-x-2 mt-6">
                        <SecondaryButton onClick={resetFilters} type="button">
                            Limpiar filtros
                        </SecondaryButton>
                        
                        <PrimaryButton onClick={applyFilters} type="button">
                            Aplicar filtros
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    );
}