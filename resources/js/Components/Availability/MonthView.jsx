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
    isAfter,
    isBefore,
    startOfDay,
    isWithinInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';

/**
 * Componente MonthView - Muestra el calendario mensual con estados de disponibilidad
 * @param {Object} props
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Function} props.onDayClick - Función a ejecutar al hacer clic en un día
 * @param {Object} props.monthData - Datos de disponibilidad del mes
 * @returns {JSX.Element}
 */
const MonthView = ({ selectedDate, onDayClick, monthData = {} }) => {
    // Fecha actual para comparar días pasados
    const today = startOfDay(new Date());
    
    // Obtener el primer y último día del mes
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Obtener todos los días que se mostrarán en el calendario
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }), // Semana empieza el lunes (1)
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
    });

    // Agrupar los días en semanas
    const weeks = [];
    let week = [];

    calendarDays.forEach((day) => {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    });

    // Verificar si tenemos datos disponibles
    const hasData = monthData && Object.keys(monthData).length > 0;
    
    // Información de depuración si está disponible
    const debugInfo = monthData?.debug || null;
    
    // Rango del mes seleccionado para verificar días fuera del mes
    const monthRange = {
        start: monthStart,
        end: monthEnd
    };

    return (
        <div className="space-y-4">
            {/* Mostrar información del mes */}
            <h3 className="text-lg font-medium text-gray-900 capitalize">
                {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
            </h3>

            {/* Mostrar advertencia si no hay datos */}
            {!hasData && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-800">
                        No hay datos de disponibilidad para este mes
                    </span>
                </div>
            )}

            {/* Calendario mejorado con mejor separación entre celdas */}
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">    
                {/* Cabecera con los días de la semana */}
                <div className="grid grid-cols-7 divide-x divide-gray-200 bg-gray-50 border-b">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName) => (
                        <div
                            key={dayName}
                            className="py-2 text-center"
                        >
                            <span className="text-sm font-medium text-gray-700">
                                {dayName}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Cuadrícula de semanas */}
                <div className="divide-y divide-gray-200">
                    {weeks.map((week, weekIndex) => (
                        <div key={`week-${weekIndex}`} className="grid grid-cols-7 divide-x divide-gray-200">
                            {week.map((day) => {
                                // Formatear la fecha para buscar datos
                                const dateStr = format(day, 'yyyy-MM-dd');
                                
                                // Obtener datos de disponibilidad para este día
                                const dayData = monthData[dateStr] || { status: 'unavailable' };
                                
                                // Determinar varios estados del día
                                const isCurrentMonth = isWithinInterval(day, monthRange);
                                const isSelectedDay = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, today);
                                const isPastDay = isBefore(day, today) && !isToday;
                                
                                // Estado efectivo considerando fechas pasadas
                                const effectiveStatus = isPastDay ? 'past' : dayData.status;

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => onDayClick(day)}
                                        disabled={isPastDay}
                                        aria-label={`Ver disponibilidad para ${format(day, "d 'de' MMMM", { locale: es })}`}
                                        className={`
                                            p-3 relative h-20 w-full text-left transition-all duration-200
                                            ${!isCurrentMonth ? 'bg-gray-50' : 'hover:bg-gray-50'}
                                            ${isSelectedDay ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}
                                            ${isToday ? 'bg-indigo-50' : ''}
                                            ${isPastDay ? 'cursor-not-allowed' : 'cursor-pointer focus:z-10'}
                                        `}
                                    >
                                        <div className="space-y-1">
                                            {/* Número del día */}
                                            <div 
                                                className={`
                                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                                    ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                                                    ${isToday ? 'bg-indigo-600 text-white' : ''}
                                                    ${isSelectedDay && !isToday ? 'bg-indigo-100' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                            
                                            {/* Información de disponibilidad */}
                                            <div className="mt-1 flex flex-col items-center">
                                                <StatusBadge
                                                    status={effectiveStatus}
                                                    interactive={false}
                                                    dimmed={!isCurrentMonth || isPastDay}
                                                />
                                                
                                                {/* Contador de reservas si está disponible */}
                                                {dayData.reservas_count && isCurrentMonth && !isPastDay && (
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        {dayData.reservas_count} {dayData.reservas_count === 1 ? 'reserva' : 'reservas'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            
            
            
            {/* Panel de depuración (solo visible en desarrollo) */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
                <div className="p-2 mt-4 bg-blue-50 text-blue-700 rounded text-xs">
                    <details>
                        <summary className="font-bold cursor-pointer">Información de Depuración</summary>
                        <div className="mt-1 pl-2">
                            <div>Fecha de consulta: {debugInfo.fecha_consulta}</div>
                            <div>Tipo de espacio: {debugInfo.espacio_tipo}</div>
                            <div>Datos disponibles: {debugInfo.data_count}</div>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

export default MonthView;