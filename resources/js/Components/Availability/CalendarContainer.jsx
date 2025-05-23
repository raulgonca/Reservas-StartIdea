import React from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import DateNavigator from './DateNavigator';
import LoadingState from './LoadingState';
import { format } from 'date-fns';

/**
 * Componente CalendarContainer - Contenedor principal para las diferentes vistas del calendario de disponibilidad
 * 
 * Este componente funciona como un hub centralizado que gestiona la visualización de las
 * diferentes vistas de disponibilidad (día, semana, mes) y proporciona la navegación
 * entre ellas. Delega la renderización específica a componentes especializados y maneja
 * el estado de carga para mostrar skeletons cuando es necesario.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.selectedDate - Fecha seleccionada para mostrar
 * @param {string} props.viewType - Tipo de vista actual (day, week, month)
 * @param {Array} props.escritorios - Lista de escritorios con su disponibilidad (para espacios coworking)
 * @param {Array} props.slots - Lista de slots de tiempo disponibles (para vista diaria)
 * @param {Object} props.weekData - Datos de disponibilidad para la vista semanal
 * @param {Object} props.monthData - Datos de disponibilidad para la vista mensual
 * @param {Function} props.onDateChange - Función para cambiar la fecha seleccionada
 * @param {Function} props.onViewChange - Función para cambiar el tipo de vista
 * @param {Function} props.onNavigateNext - Función para navegar a la siguiente fecha
 * @param {Function} props.onNavigatePrevious - Función para navegar a la fecha anterior
 * @param {Function} props.onNavigateToday - Función para navegar a la fecha actual
 * @param {Function} props.onDayClick - Función que se ejecuta al hacer clic en un día específico
 * @param {string} props.tipoEspacio - Tipo de espacio ('coworking', 'sala', etc.)
 * @param {number|string} props.espacioId - ID único del espacio
 * @param {Function} props.onRefresh - Función para refrescar los datos manualmente
 * @param {boolean} props.loading - Indica si los datos están cargando actualmente
 * @returns {JSX.Element} - El componente de contenedor del calendario renderizado
 */
const CalendarContainer = ({
    // Estado actual
    selectedDate = new Date(),
    viewType = 'day',
    
    // Datos de disponibilidad
    escritorios = [],
    slots = [],
    weekData = {},
    monthData = {},
    
    // Callbacks
    onDateChange,
    onViewChange,
    onNavigateNext,
    onNavigatePrevious,
    onNavigateToday,
    onDayClick,
    onRefresh,
    
    // Información del espacio
    tipoEspacio = 'common',
    espacioId,
    
    // Estado de carga
    loading = false
}) => {
    /**
     * Renderiza la vista de disponibilidad apropiada según el tipo seleccionado
     * Gestiona también el estado de carga mostrando skeletons cuando es necesario
     * 
     * @returns {JSX.Element} El componente de vista específico o un skeleton de carga
     */
    const renderAvailabilityView = () => {
        // Si está cargando, mostrar el skeleton adecuado
        if (loading) {
            return <LoadingState viewMode={viewType} />;
        }
        
        // Renderizar la vista correspondiente según el tipo seleccionado
        switch (viewType) {
            case 'day':
                return (
                    <DayView 
                        selectedDate={selectedDate}
                        tipoEspacio={tipoEspacio}
                        escritorios={escritorios}
                        slots={slots}
                    />
                );
            
            case 'week':
                return (
                    <WeekView 
                        selectedDate={selectedDate}
                        weekData={weekData}
                        onDayClick={onDayClick}
                    />
                );
            
            case 'month':
                return (
                    <MonthView 
                        selectedDate={selectedDate}
                        monthData={monthData}
                        onDayClick={onDayClick}
                    />
                );
            
            default:
                return <p>Vista no disponible</p>;
        }
    };

    /**
     * Maneja el cambio entre diferentes vistas del calendario
     * 
     * @param {string} newView - Nueva vista a seleccionar ('day', 'week', 'month')
     */
    const handleViewChange = (newView) => {
        if (onViewChange && newView !== viewType) {
            onViewChange(newView);
        }
    };

    // Formatear la fecha para mostrarla en formato ISO
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Cabecera del calendario con acciones */}
            <div className="border-b border-gray-100">
                {/* DateNavigator con efectos visuales mejorados */}
                <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
                    <DateNavigator 
                        currentDate={selectedDate}
                        view={viewType}
                        onDateChange={onDateChange}
                        onPrevious={onNavigatePrevious}
                        onNext={onNavigateNext}
                        onToday={onNavigateToday}
                    />
                </div>
                
                {/* Barra de acciones con controles de vista y estado de carga */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 bg-white">
                    {/* Indicador de carga con animación */}
                    <div className={`order-2 sm:order-1 mt-2 sm:mt-0 ${loading ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="mr-2 h-2 w-2 bg-indigo-500 rounded-full animate-ping"></div>
                            <span className="text-xs">Cargando datos...</span>
                        </div>
                    </div>
                    
                    {/* Controles de vista y acciones */}
                    <div className="order-1 sm:order-2 flex items-center space-x-2">
                        {/* Selector de vistas con estilo de segmentos */}
                        <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner">
                            <button 
                                onClick={() => handleViewChange('day')}
                                className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                                    viewType === 'day' 
                                        ? 'bg-white shadow text-indigo-700 font-medium' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                                disabled={loading}
                                aria-label="Ver disponibilidad por día"
                                aria-pressed={viewType === 'day'}
                            >
                                Día
                            </button>
                            
                            <button 
                                onClick={() => handleViewChange('week')}
                                className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                                    viewType === 'week' 
                                        ? 'bg-white shadow text-indigo-700 font-medium' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                                disabled={loading}
                                aria-label="Ver disponibilidad por semana"
                                aria-pressed={viewType === 'week'}
                            >
                                Semana
                            </button>
                            
                            <button 
                                onClick={() => handleViewChange('month')}
                                className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                                    viewType === 'month' 
                                        ? 'bg-white shadow text-indigo-700 font-medium' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                                disabled={loading}
                                aria-label="Ver disponibilidad por mes"
                                aria-pressed={viewType === 'month'}
                            >
                                Mes
                            </button>
                        </div>
                        
                        {/* Botón para refrescar datos con tooltip */}
                        <div className="relative">
                            <button 
                                onClick={() => onRefresh && onRefresh(true)}
                                className={`p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors ${loading ? 'animate-spin' : ''}`}
                                title="Refrescar datos"
                                disabled={loading}
                                aria-label="Actualizar datos de disponibilidad"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Contenido principal del calendario */}
            <div className="p-4 bg-white">
                {renderAvailabilityView()}
            </div>
            
            {/* Pie con información adicional (visible solo en desktop) */}
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 text-xs text-gray-500 hidden sm:block">
                <div className="flex justify-between">
                    <span>Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                    <span>ID Espacio: {espacioId} · Tipo: {tipoEspacio}</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarContainer;