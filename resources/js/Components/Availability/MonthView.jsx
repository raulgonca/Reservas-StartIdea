import React from 'react';
import {
    format,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    isBefore,
    startOfDay,
    isWithinInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';
import Legend from './Legend';

/**
 * Componente MonthView - Muestra el calendario mensual con estados de disponibilidad
 * 
 * Este componente renderiza una vista mensual completa del calendario, mostrando
 * todos los días del mes seleccionado y su estado de disponibilidad. Incluye
 * información visual diferenciada para días del mes actual, días de otros meses,
 * fechas pasadas y el día de hoy.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.selectedDate - Fecha seleccionada que determina el mes a mostrar
 * @param {Function} props.onDayClick - Función a ejecutar al hacer clic en un día
 * @param {Object} props.monthData - Datos de disponibilidad indexados por fecha YYYY-MM-DD
 * @returns {JSX.Element} - Componente de visualización mensual
 */
const MonthView = ({ selectedDate, onDayClick, monthData = {} }) => {
    // Fecha actual para comparar días pasados
    const today = startOfDay(new Date());
    
    // Obtener el primer y último día del mes
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Obtener todos los días que se mostrarán en el calendario (incluyendo días de meses adyacentes)
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }), // Semana empieza el lunes (1)
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
    });

    // Agrupar los días en semanas para estructura de cuadrícula
    const weeks = [];
    let week = [];

    calendarDays.forEach((day) => {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    });

    // Verificar si tenemos datos disponibles para mostrar
    const hasData = monthData && Object.keys(monthData).length > 0;
    
    // Rango del mes seleccionado para verificar días fuera del mes
    const monthRange = {
        start: monthStart,
        end: monthEnd
    };
    
    /**
     * Obtiene la clase de color de fondo según el estado de disponibilidad
     * @param {string} status - Estado de disponibilidad ('free', 'partial', etc.)
     * @param {boolean} isCurrentMonth - Si el día pertenece al mes actual
     * @returns {string} - Clase CSS de Tailwind para el color de fondo
     */
    const getStatusBackgroundColor = (status, isCurrentMonth) => {
        // Para días fuera del mes actual, usar un tono más claro
        const opacity = isCurrentMonth ? '' : '/30';
        
        switch (status) {
            case 'free':
                return `bg-green-100${opacity}`;
            case 'partial':
                return `bg-yellow-100${opacity}`;
            case 'occupied':
            case 'unavailable':
                return `bg-red-100${opacity}`;
            case 'past':
                return 'bg-gray-100';
            default:
                return '';
        }
    };
    
    /**
     * Obtiene la clase de color de borde según el estado de disponibilidad
     * @param {string} status - Estado de disponibilidad ('free', 'partial', etc.)
     * @param {boolean} isCurrentMonth - Si el día pertenece al mes actual
     * @returns {string} - Clase CSS de Tailwind para el color de borde
     */
    const getStatusBorderColor = (status, isCurrentMonth) => {
        // Para días fuera del mes actual, usar un borde más claro
        const opacity = isCurrentMonth ? '' : '/50';
        
        switch (status) {
            case 'free':
                return `border-green-200${opacity}`;
            case 'partial':
                return `border-yellow-200${opacity}`;
            case 'occupied':
            case 'unavailable':
                return `border-red-200${opacity}`;
            case 'past':
                return 'border-gray-200';
            default:
                return 'border-gray-100';
        }
    };

    return (
        <div className="space-y-4">
            {/* Encabezado del mes y leyenda con layout responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-800 capitalize py-2 px-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
                </h3>
                
                {/* Leyenda de estados de disponibilidad */}
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm sm:w-auto w-full">
                    <Legend />
                </div>
            </div>

            {/* Mensaje de advertencia cuando no hay datos disponibles */}
            {!hasData && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg flex items-center mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800">
                        No hay datos de disponibilidad para este mes
                    </span>
                </div>
            )}

            {/* Calendario con estructura de cuadrícula */}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-md">    
                {/* Cabecera con nombres de los días de la semana */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName, index) => (
                        <div
                            key={dayName}
                            className={`py-3 text-center border-r border-gray-100 
                                      ${index === 6 ? 'border-r-0' : ''}`}
                        >
                            {/* Nombre completo en pantallas medianas o mayores */}
                            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                                {dayName}
                            </span>
                            {/* Inicial en pantallas pequeñas */}
                            <span className="text-xs font-semibold text-gray-700 sm:hidden">
                                {dayName.substring(0, 1)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Cuadrícula con las semanas y días del mes */}
                <div className="divide-y divide-gray-200">
                    {weeks.map((week, weekIndex) => (
                        <div key={`week-${weekIndex}`} className="grid grid-cols-7 divide-x divide-gray-100">
                            {week.map((day) => {
                                // Formatear la fecha para buscar datos en el objeto monthData
                                const dateStr = format(day, 'yyyy-MM-dd');
                                
                                // Obtener datos de disponibilidad para este día (o usar valor predeterminado)
                                const dayData = monthData[dateStr] || { status: 'unavailable' };
                                
                                // Determinar varios estados visuales del día
                                const isCurrentMonth = isWithinInterval(day, monthRange);
                                const isSelectedDay = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, today);
                                const isPastDay = isBefore(day, today) && !isToday;
                                
                                // Estado efectivo considerando fechas pasadas (prioridad al estado "past")
                                const effectiveStatus = isPastDay ? 'past' : dayData.status;
                                
                                // Obtener clases CSS para visualización en móvil
                                const statusBgColor = getStatusBackgroundColor(effectiveStatus, isCurrentMonth);
                                const statusBorderColor = getStatusBorderColor(effectiveStatus, isCurrentMonth);

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => onDayClick(day)}
                                        disabled={isPastDay} // Deshabilitar interacción para fechas pasadas
                                        aria-label={`Ver disponibilidad para ${format(day, "d 'de' MMMM", { locale: es })}`}
                                        className={`
                                            p-2 sm:p-3 relative h-16 sm:h-20 w-full text-left transition-all duration-200
                                            ${!isCurrentMonth ? 'bg-gray-50' : 'hover:bg-blue-50 hover:shadow-inner'}
                                            ${isSelectedDay ? 'ring-2 ring-inset ring-indigo-500 z-10 shadow-inner' : ''}
                                            ${isToday ? 'bg-indigo-50' : ''}
                                            ${isPastDay ? 'cursor-not-allowed' : 'cursor-pointer focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-400'}
                                        `}
                                    >
                                        <div className="flex flex-col h-full">
                                            {/* Número del día con diseño especial para día actual y seleccionado */}
                                            <div 
                                                className={`
                                                    text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full
                                                    ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                                                    ${isToday ? 'bg-indigo-600 text-white shadow-sm' : ''}
                                                    ${isSelectedDay && !isToday ? 'bg-indigo-100' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                            
                                            {/* Información de disponibilidad con diseño responsive */}
                                            <div className="mt-auto flex flex-col items-center justify-end">
                                                {/* Versión desktop - Badge con texto completo */}
                                                <div className="hidden md:block">
                                                    <StatusBadge
                                                        status={effectiveStatus}
                                                        interactive={false}
                                                        dimmed={!isCurrentMonth || isPastDay}
                                                    />
                                                    
                                                    {/* Contador de reservas en desktop */}
                                                    {dayData.reservas_count && isCurrentMonth && !isPastDay && (
                                                        <span className="text-xs text-gray-500 mt-1 text-center block">
                                                            {dayData.reservas_count} {dayData.reservas_count === 1 ? 'reserva' : 'reservas'}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Versión móvil - Indicador de color minimalista */}
                                                <div className={`
                                                    md:hidden w-full h-2 mt-1 rounded-full ${statusBgColor} border ${statusBorderColor}
                                                    ${dayData.reservas_count ? 'h-3' : 'h-2'}
                                                `}>
                                                    {/* Número de reservas compacto para móvil */}
                                                    {dayData.reservas_count > 0 && isCurrentMonth && !isPastDay && (
                                                        <div className="flex justify-center items-center w-full h-full">
                                                            <span className="text-[10px] font-medium">
                                                                {dayData.reservas_count}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MonthView;