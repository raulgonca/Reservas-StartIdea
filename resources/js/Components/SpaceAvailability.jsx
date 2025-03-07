import React, { useState, useImperativeHandle, forwardRef } from 'react';
import CalendarContainer from './Availability/CalendarContainer';
import useAvailabilityData from '../Hooks/useAvailabilityData';

/**
 * Componente principal para mostrar la disponibilidad de espacios
 * 
 * Este componente actúa como contenedor y orquestador principal para la visualización
 * de disponibilidad de espacios. Utiliza el hook useAvailabilityData para gestionar
 * los datos y estados, y delega la presentación visual al CalendarContainer.
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.space - Información del espacio
 * @param {number|string} props.space.id - Identificador único del espacio
 * @param {string} [props.space.tipo='common'] - Tipo del espacio (coworking, sala, etc.)
 * @param {React.Ref} ref - Referencia para acceder a métodos expuestos (refreshData)
 * @returns {JSX.Element} Componente de disponibilidad de espacio renderizado
 */
const SpaceAvailability = forwardRef(({ space }, ref) => {
    // Estado local para indicar visualmente cuando se está refrescando
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Implementamos el hook personalizado con el ID del espacio y opciones de configuración
    const { 
        // Estados
        data,
        loading, 
        error,
        selectedDate,
        viewMode,
        tipoEspacio,
        
        // Métodos para manipular la vista
        setSelectedDate,
        setViewMode,
        navigateNext,
        navigatePrevious,
        navigateToToday,
        goToDateWithView,
        refreshData
    } = useAvailabilityData(space.id, {
        initialDate: new Date(),
        initialView: 'day',
        tipoEspacio: space.tipo || 'common', // Usar el tipo del espacio o 'common' por defecto
        useCache: true // Habilitar caché para mejorar rendimiento
    });

    // Exponemos el método refreshData a través de la ref, añadiendo indicador de actualización
    useImperativeHandle(ref, () => ({
        refreshData: async (bypassCache = true) => {
            setIsRefreshing(true);
            try {
                // Añadimos un pequeño retraso para asegurar que los datos del servidor están actualizados
                await new Promise(resolve => setTimeout(resolve, 800));
                await refreshData(bypassCache);
                console.log('Datos de disponibilidad actualizados para espacio:', space.id);
            } catch (error) {
                console.error('Error al actualizar datos de disponibilidad:', error);
            } finally {
                // Añadir un pequeño retraso adicional para que el usuario note la actualización
                setTimeout(() => {
                    setIsRefreshing(false);
                }, 400);
            }
        }
    }));

    // Mostrar mensaje de error con opción para reintentar cuando hay un problema
    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={() => refreshData(true)} // Forzar recarga ignorando caché
                    className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    aria-label="Intentar cargar la disponibilidad nuevamente"
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Título de la sección con indicador de actualización */}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center mb-4 flex items-center justify-center">
                Disponibilidad
                {isRefreshing && (
                    <span className="ml-2 inline-flex items-center">
                        <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-1 text-sm text-indigo-600 font-normal">Actualizando...</span>
                    </span>
                )}
            </h2>
            
            {/* Contenedor con overlay de actualización */}
            <div className="relative">
                {isRefreshing && (
                    <div className="absolute inset-0 bg-gray-800/20 dark:bg-gray-900/40 z-10 flex items-center justify-center rounded-lg">
                        <div className="bg-white dark:bg-gray-700 py-2 px-4 rounded-md shadow-lg flex items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Actualizando disponibilidad</span>
                        </div>
                    </div>
                )}
                
                {/* Contenedor del calendario con estilos visuales */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
                    <CalendarContainer 
                        // Datos de disponibilidad según la vista actual
                        escritorios={data.escritorios}
                        slots={data.slots}
                        weekData={data.weekData}
                        monthData={data.monthData}
                        
                        // Estados de navegación y selección
                        selectedDate={selectedDate}
                        viewType={viewMode}
                        
                        // Funciones de navegación y control
                        onDateChange={setSelectedDate}
                        onViewChange={setViewMode}
                        onNavigateNext={navigateNext}
                        onNavigatePrevious={navigatePrevious}
                        onNavigateToday={navigateToToday}
                        onDayClick={(date) => goToDateWithView(date, 'day')}
                        
                        // Información de contexto del espacio
                        espacioId={space.id}
                        tipoEspacio={tipoEspacio}
                        
                        // Función para actualizar datos manualmente
                        onRefresh={refreshData}
                        
                        // Estado de carga para mostrar skeletons
                        loading={loading || isRefreshing}
                    />
                </div>
            </div>
        </div>
    );
});

// Asignamos un displayName para mejorar la depuración y satisfacer las reglas de ESLint
SpaceAvailability.displayName = 'SpaceAvailability';

export default SpaceAvailability;