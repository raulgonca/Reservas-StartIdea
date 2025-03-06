import React from 'react';
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
 * @returns {JSX.Element} Componente de disponibilidad de espacio renderizado
 */
const SpaceAvailability = ({ space }) => {
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
        <div >
            {/* Título de la sección */}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-600 text-center mb-4">
                Disponibilidad
            </h2>
            
            {/* Contenedor del calendario con estilos visuales */}
            <div className="bg-white rounded-lg shadow p-4">
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
                    onDayClick={(date) => goToDateWithView(date, 'day')} // Al hacer clic en un día, cambiar a vista diaria
                    
                    // Información de contexto del espacio
                    espacioId={space.id}
                    tipoEspacio={tipoEspacio}
                    
                    // Función para actualizar datos manualmente
                    onRefresh={refreshData}
                    
                    // Estado de carga para mostrar skeletons
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default SpaceAvailability;