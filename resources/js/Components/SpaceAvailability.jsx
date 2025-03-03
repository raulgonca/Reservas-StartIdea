import React from 'react';
import CalendarContainer from './Availability/CalendarContainer';
import useAvailabilityData from '../Hooks/useAvailabilityData';

/**
 * Componente principal para mostrar la disponibilidad de espacios
 * @component
 * @param {Object} props
 * @param {Object} props.space - Información del espacio (id, tipo, etc)
 */
const SpaceAvailability = ({ space }) => {
    // Implementamos el hook personalizado con el ID del espacio y opciones
    const { 
        // Estados
        data,
        loading, 
        error,
        selectedDate,
        viewMode,
        tipoEspacio,
        
        // Métodos
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

    // Estado de carga - muestra un skeleton
    if (loading && Object.keys(data.escritorios).length === 0) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    // Estado de error - muestra mensaje y botón para reintentar
    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={() => refreshData(true)} // Forzar recarga ignorando caché
                    className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                Disponibilidad
            </h2>
            
            <div className="bg-white rounded-lg shadow p-4">
                <CalendarContainer 
                    // Datos de disponibilidad
                    escritorios={data.escritorios}
                    slots={data.slots}
                    weekData={data.weekData}
                    monthData={data.monthData}
                    
                    // Estados actuales
                    selectedDate={selectedDate}
                    viewType={viewMode}
                    
                    // Funciones de control
                    onDateChange={setSelectedDate}
                    onViewChange={setViewMode}
                    onNavigateNext={navigateNext}
                    onNavigatePrevious={navigatePrevious}
                    onNavigateToday={navigateToToday}
                    onDayClick={(date) => goToDateWithView(date, 'day')}
                    
                    // Información del espacio
                    espacioId={space.id}
                    tipoEspacio={tipoEspacio}
                    
                    // Función para actualizar datos
                    onRefresh={refreshData}
                />
            </div>
        </div>
    );
};

export default SpaceAvailability;