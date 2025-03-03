import React from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import DateNavigator from './DateNavigator';

/**
 * Componente CalendarContainer - Gestiona las diferentes vistas del calendario
 * @param {Object} props
 * @param {Array} props.escritorios - Datos de escritorios para la vista diaria
 * @param {Array} props.slots - Datos de slots para la vista diaria
 * @param {Object} props.weekData - Datos de disponibilidad semanal
 * @param {Object} props.monthData - Datos de disponibilidad mensual
 * @param {Date} props.selectedDate - Fecha seleccionada actualmente
 * @param {string} props.viewType - Tipo de vista actual ('day', 'week', 'month')
 * @param {Function} props.onDateChange - Función para cambiar la fecha seleccionada
 * @param {Function} props.onViewChange - Función para cambiar el tipo de vista
 * @param {Function} props.onNavigateNext - Función para navegar a la siguiente fecha
 * @param {Function} props.onNavigatePrevious - Función para navegar a la fecha anterior
 * @param {Function} props.onNavigateToday - Función para navegar a la fecha actual
 * @param {Function} props.onDayClick - Función para manejar el clic en un día
 * @param {boolean} props.loading - Indica si los datos están cargando
 * @param {string} props.tipoEspacio - Tipo de espacio (coworking, sala, etc.)
 * @returns {JSX.Element}
 */
const CalendarContainer = ({ 
    // Datos
    escritorios = [],
    slots = [],
    weekData = {},
    monthData = {},
    
    // Estados
    selectedDate = new Date(),
    viewType = 'day',
    loading = false,
    
    // Información del espacio
    espacioId,
    tipoEspacio = 'common',
    
    // Funciones de control
    onDateChange = () => {},
    onViewChange = () => {},
    onNavigateNext = () => {},
    onNavigatePrevious = () => {},
    onNavigateToday = () => {},
    onDayClick = () => {},
    onRefresh = () => {}
}) => {
    // Componentes de skeleton para cada tipo de vista (sin cambios)
    const DayViewSkeleton = () => (
        <div className="animate-pulse">
            {/* Simulación de un escritorio/espacio */}
            <div className="mb-6">
                <div className="h-7 bg-gray-200 w-48 rounded-md mb-3"></div>
                <div className="border rounded-lg overflow-hidden">
                    {/* Encabezados de horas */}
                    <div className="flex border-b">
                        <div className="w-1/4 h-10 bg-gray-100 border-r"></div>
                        <div className="w-3/4 flex">
                            <div className="flex-1 h-10 bg-gray-50 px-2 flex items-center justify-center border-r">
                                <div className="h-4 bg-gray-200 w-16 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Filas de horas (12 slots) */}
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="flex border-b last:border-b-0">
                            {/* Hora */}
                            <div className="w-1/4 h-12 px-3 py-2 border-r flex items-center">
                                <div className="h-4 bg-gray-200 w-14 rounded-md"></div>
                            </div>
                            {/* Estado del slot */}
                            <div className="w-3/4 h-12 px-3 py-2 flex items-center">
                                <div className={`h-6 rounded-md w-full ${
                                    i % 3 === 0 ? 'bg-green-100' : 
                                    i % 3 === 1 ? 'bg-yellow-100' : 
                                    'bg-red-100'
                                }`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const WeekViewSkeleton = () => (
        <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Cabecera de días de la semana */}
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="text-center">
                        <div className="h-5 bg-gray-200 w-8 mx-auto rounded-md mb-1"></div>
                        <div className="h-8 bg-gray-200 w-8 mx-auto rounded-full"></div>
                    </div>
                ))}
            </div>
            
            {/* Contenido de la semana */}
            <div className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-24 rounded-md border p-2 ${
                            i % 3 === 0 ? 'bg-green-50' : 
                            i % 3 === 1 ? 'bg-yellow-50' : 
                            'bg-red-50'
                        }`}
                    >
                        <div className="h-4 bg-gray-200 w-2/3 rounded-md mb-2"></div>
                        <div className="h-3 bg-gray-200 w-1/2 rounded-md mb-2"></div>
                        <div className="h-3 bg-gray-200 w-3/4 rounded-md"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const MonthViewSkeleton = () => (
        <div className="animate-pulse">
            {/* Cabecera con nombres de días */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                    <div key={i} className="text-center">
                        <div className="h-5 bg-gray-200 w-8 mx-auto rounded-md"></div>
                    </div>
                ))}
            </div>
            
            {/* Cuadrícula del mes (5 semanas) */}
            {[...Array(5)].map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                    {[...Array(7)].map((_, dayIndex) => {
                        // Crear algunos días no disponibles para que se vea más realista
                        const isCurrentMonth = weekIndex !== 0 || dayIndex > 2;
                        const statusClass = isCurrentMonth 
                            ? ((weekIndex + dayIndex) % 4 === 0) 
                                ? 'bg-red-50' 
                                : ((weekIndex + dayIndex) % 4 === 1) 
                                    ? 'bg-yellow-50' 
                                    : 'bg-green-50'
                            : 'bg-gray-50';
                            
                        return (
                            <div 
                                key={dayIndex} 
                                className={`h-16 rounded-md border p-1 ${statusClass}`}
                            >
                                {/* Número de día */}
                                <div className="h-6 w-6 rounded-full mx-auto mb-1 flex items-center justify-center">
                                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                                </div>
                                {isCurrentMonth && (
                                    <div className="h-2 bg-gray-200 w-1/2 rounded-md mx-auto"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    // Selector de vista actual con skeletons realistas
    const renderCurrentView = () => {
        if (loading) {
            switch (viewType) {
                case 'week':
                    return <WeekViewSkeleton />;
                case 'month':
                    return <MonthViewSkeleton />;
                default:
                    return <DayViewSkeleton />;
            }
        }

        switch (viewType) {
            case 'week':
                return (
                    <WeekView 
                        selectedDate={selectedDate}
                        onDayClick={onDayClick}
                        weekData={weekData}
                    />
                );
            case 'month':
                return (
                    <MonthView 
                        selectedDate={selectedDate}
                        onDayClick={onDayClick}
                        monthData={monthData}
                    />
                );
            default:
                return (
                    <DayView 
                        selectedDate={selectedDate}
                        escritorios={escritorios}
                        slots={slots}
                        tipoEspacio={tipoEspacio}
                    />
                );
        }
    };

    // Función auxiliar para formatear la fecha para DateNavigator
    const formatDateForNavigator = () => {
        return selectedDate instanceof Date 
            ? selectedDate.toISOString().split('T')[0]
            : (typeof selectedDate === 'string' ? selectedDate : new Date().toISOString().split('T')[0]);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Cabecera con navegación y selección de vista */}
            <div className="border-b border-gray-200">
                {/* Navegador de fechas con estilo mejorado */}
                <div className="p-4 border-b border-gray-100">
                    <DateNavigator 
                        currentDate={formatDateForNavigator()}
                        view={viewType}
                        onDateChange={onDateChange}
                        onPrevious={onNavigatePrevious}
                        onNext={onNavigateNext}
                        onToday={onNavigateToday}
                    />
                </div>
                
                {/* Selector de tipo de vista con mejor contraste */}
                <div className="flex justify-center py-3 px-4 bg-gray-50">
                    <div className="inline-flex rounded-md shadow-sm bg-gray-200 p-1" role="group" aria-label="Selección de vista">
                        {[
                            { key: 'day', label: 'Día', icon: '📅' },
                            { key: 'week', label: 'Semana', icon: '📆' },
                            { key: 'month', label: 'Mes', icon: '📋' }
                        ].map(({ key, label, icon }) => (
                            <button
                                key={key}
                                onClick={() => onViewChange(key)}
                                className={`
                                    relative px-4 py-2 text-sm font-medium rounded-md
                                    focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                    transition-all duration-200 flex items-center
                                    ${viewType === key 
                                        ? 'bg-white text-indigo-700 shadow'
                                        : 'text-gray-700 hover:bg-gray-100'}
                                `}
                                aria-current={viewType === key ? 'page' : undefined}
                            >
                                <span className="mr-1.5" aria-hidden="true">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contenedor principal con padding consistente */}
            <div className="relative p-4">
                {/* Vista actual del calendario (ahora con skeletons realistas) */}
                <div className="transition-all duration-300">
                    {renderCurrentView()}
                </div>
                
                {/* Leyenda de colores */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm border-t border-gray-100 pt-4">
                    <div className="flex items-center">
                        <span className="w-4 h-4 inline-block bg-green-100 border border-green-200 rounded-sm mr-2"></span>
                        <span className="text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-4 h-4 inline-block bg-yellow-100 border border-yellow-200 rounded-sm mr-2"></span>
                        <span className="text-gray-600">Parcialmente ocupado</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-4 h-4 inline-block bg-red-100 border border-red-200 rounded-sm mr-2"></span>
                        <span className="text-gray-600">No disponible</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarContainer;