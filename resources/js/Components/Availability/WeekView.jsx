import React from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isBefore, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';

/**
 * Componente WeekView - Muestra la disponibilidad semanal
 * @param {Object} props
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Function} props.onDayClick - Función a ejecutar al hacer clic en un día
 * @param {Object} props.weekData - Datos de disponibilidad de la semana
 * @returns {JSX.Element}
 */
const WeekView = ({ selectedDate, onDayClick, weekData = {} }) => {
    // Log para depuración
    console.log('WeekView Data:', weekData);
    
    // Info de depuración
    const hasData = Object.keys(weekData).length > 0;
    const debugInfo = weekData?.debug || null;
    
    // Fecha actual para comparar días pasados
    const today = startOfDay(new Date());
    
    // Obtener todos los días de la semana actual
    const weekDays = eachDayOfInterval({
        start: startOfWeek(selectedDate, { locale: es }),
        end: endOfWeek(selectedDate, { locale: es })
    });

    // Obtener el mes actual para comparación
    const currentMonth = selectedDate.getMonth();

    return (
        <div className="space-y-4">
            {/* Panel de depuración */}
            {debugInfo && (
                <div className="p-2 mb-4 bg-blue-50 text-blue-700 rounded text-xs">
                    <div className="font-bold mb-1">Información de Depuración:</div>
                    <div>Fecha de consulta: {debugInfo.fecha_consulta}</div>
                    <div>Tipo de espacio: {debugInfo.espacio_tipo}</div>
                    <div>Rango: {debugInfo.primera_fecha} a {debugInfo.ultima_fecha}</div>
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
                {format(selectedDate, "'Semana del' d 'de' MMMM", { locale: es })}
            </h3>

            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    // Usar disponibilidad real o 'free' como predeterminado
                    const dayData = weekData[dateStr] || { status: 'free' };
                    
                    // Verificar si es día de otro mes o día actual
                    const isCurrentMonth = isSameMonth(day, selectedDate);
                    const isToday = isSameDay(day, today);
                    
                    // CORREGIDO: Verificar si es un día pasado (anterior a hoy, pero NO hoy)
                    const isPastDay = isBefore(day, today) && !isToday;
                    
                    // Para días pasados, forzamos un estado específico
                    const effectiveStatus = isPastDay ? 'past' : dayData.status;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            disabled={isPastDay} // Desactivar botón para días pasados
                            className={`
                                p-4 border rounded-lg transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-indigo-500
                                ${isPastDay ? 'cursor-not-allowed bg-gray-50' : 'hover:shadow-sm hover:border-gray-300'}
                                ${format(selectedDate, 'yyyy-MM-dd') === dateStr ? 'border-indigo-200 shadow-sm' : ''}
                                ${isToday ? 'border-indigo-300 bg-indigo-50' : ''}
                                ${!isCurrentMonth && !isPastDay ? 'border-dashed border-gray-200' : ''}
                            `}
                        >
                            <div className="space-y-2">
                                <div className="text-center">
                                    <p className={`
                                        text-sm font-medium capitalize
                                        ${isPastDay ? 'text-gray-400' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}
                                    `}>
                                        {format(day, 'EEEE', { locale: es })}
                                    </p>
                                    <p className={`
                                        text-2xl font-bold
                                        ${isPastDay ? 'text-gray-400' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}
                                    `}>
                                        {format(day, 'd')}
                                    </p>
                                    
                                    {/* Mostrar el mes para días de otro mes */}
                                    {!isCurrentMonth && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(day, 'MMMM', { locale: es })}
                                        </p>
                                    )}
                                    
                                    {/* Etiqueta especial para "Hoy" */}
                                    {isToday && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 mt-1">
                                            Hoy
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-center flex-col items-center">
                                    <StatusBadge
                                        status={effectiveStatus}
                                        interactive={false}
                                        dimmed={!isCurrentMonth && !isPastDay} // Días de otro mes se atenúan, pero los pasados tienen su propio estilo
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekView;