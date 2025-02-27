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
    startOfDay
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
    // Log para depuración
    console.log('MonthView Data:', monthData);
    
    // Info de depuración
    const hasData = monthData && Object.keys(monthData).length > 0;
    const debugInfo = monthData?.debug || null;
    
    // Fecha actual para comparar días pasados
    const today = startOfDay(new Date());
    
    // Obtener el primer y último día del mes
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Obtener todos los días que se mostrarán en el calendario
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart, { locale: es }),
        end: endOfWeek(monthEnd, { locale: es })
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

    return (
        <div className="space-y-4">
            {/* Panel de depuración */}
            {debugInfo && (
                <div className="p-2 mb-4 bg-blue-50 text-blue-700 rounded text-xs">
                    <div className="font-bold mb-1">Información de Depuración:</div>
                    <div>Fecha de consulta: {debugInfo.fecha_consulta}</div>
                    <div>Tipo de espacio: {debugInfo.espacio_tipo}</div>
                    <div>Datos disponibles: {debugInfo.data_count}</div>
                </div>
            )}
            
            {/* Mostrar advertencia si no hay datos */}
            {!hasData && (
                <div className="p-2 bg-yellow-50 text-yellow-700 rounded">
                    ⚠️ No hay datos de disponibilidad disponibles
                </div>
            )}
            
            <h3 className="text-lg font-medium text-gray-900 capitalize">
                {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
            </h3>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">    
                {/* Cabecera con los días de la semana */}
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName) => (
                    <div
                        key={dayName}
                        className="bg-gray-50 py-2 text-center"
                    >
                        <span className="text-sm font-medium text-gray-700">
                            {dayName}
                        </span>
                    </div>
                ))}

                {/* Días del mes */}
                {weeks.map((week, weekIndex) => (
                    <React.Fragment key={`week-${weekIndex}`}>
                        {week.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            // Usar el estado real si existe, o 'free' como valor predeterminado
                            const dayData = monthData[dateStr] || { status: 'free' };
                            const isCurrentMonth = isSameMonth(day, selectedDate);
                            const isSelectedDay = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, today);
                            
                            // CORREGIDO: Verificar si es un día pasado, excluyendo el día actual
                            const isPastDay = isBefore(day, today) && !isToday;
                            
                            // Para días pasados, forzamos un estado específico
                            const effectiveStatus = isPastDay ? 'past' : dayData.status;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => onDayClick(day)}
                                    disabled={isPastDay} // Desactivar botón para días pasados
                                    className={`
                                        p-2 bg-white transition-all duration-200 relative
                                        hover:z-10 focus:z-10
                                        ${!isCurrentMonth ? 'opacity-75 bg-gray-50' : 'hover:shadow-lg'}
                                        ${isSelectedDay ? 'ring-2 ring-indigo-500 z-10' : ''}
                                        ${isToday ? 'border-2 border-indigo-300 bg-indigo-50' : ''}
                                        ${isPastDay ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className="space-y-1">
                                        <p className={`
                                            text-sm font-medium
                                            ${isPastDay ? 'text-gray-400' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}
                                            ${isToday ? 'text-indigo-700 font-bold' : ''}
                                        `}>
                                            {format(day, 'd')}
                                            {isToday && <span className="text-xs ml-1 text-indigo-600">(hoy)</span>}
                                        </p>
                                        <div className="flex justify-center flex-col items-center">
                                            {/* Pasamos el estado que corresponde según la fecha */}
                                            <StatusBadge
                                                status={effectiveStatus}
                                                interactive={false}
                                                dimmed={!isCurrentMonth || isPastDay}
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default MonthView;