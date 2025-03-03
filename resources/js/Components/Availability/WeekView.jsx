import React from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isBefore, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';
import Legend from './Legend';

/**
 * Componente WeekView - Muestra la disponibilidad semanal
 * @param {Object} props
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Function} props.onDayClick - Función a ejecutar al hacer clic en un día
 * @param {Object} props.weekData - Datos de disponibilidad de la semana
 * @returns {JSX.Element}
 */
const WeekView = ({ selectedDate, onDayClick, weekData = {} }) => {
    // Verificar si tenemos datos
    const hasData = Object.keys(weekData).length > 0;
    const debugInfo = weekData?.debug || null;
    
    // Fecha actual para comparar días pasados
    const today = startOfDay(new Date());
    
    // Obtener todos los días de la semana actual, empezando el lunes
    const weekDays = eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }), // Lunes como primer día
        end: endOfWeek(selectedDate, { weekStartsOn: 1 }) // Domingo como último día
    });

    // Obtener el mes actual para comparación
    const currentMonth = selectedDate.getMonth();

    return (
        <div className="space-y-4">
            {/* Título de la semana y leyenda - Con layout flexible */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize py-2 px-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    {format(weekDays[0], "'Semana del' d 'de' MMMM", { locale: es })}
                    {format(weekDays[0], 'MMM', { locale: es }) !== format(weekDays[6], 'MMM', { locale: es }) && 
                        ` al ${format(weekDays[6], "d 'de' MMMM", { locale: es })}`}
                </h3>
                
                {/* Leyenda integrada */}
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm sm:w-auto w-full">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Leyenda:</h4>
                    <Legend />
                </div>
            </div>
            
            {/* Mostrar advertencia si no hay datos */}
            {!hasData && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-800">
                        No hay datos de disponibilidad para esta semana
                    </span>
                </div>
            )}

            {/* Grid de días mejorado con diseño responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    // Usar disponibilidad real o 'unavailable' como predeterminado cuando no hay datos
                    const dayData = weekData[dateStr] || { status: 'unavailable' };
                    
                    // Verificar diferentes estados del día
                    const isCurrentMonth = isSameMonth(day, selectedDate);
                    const isToday = isSameDay(day, today);
                    const isPastDay = isBefore(day, today) && !isToday;
                    const isSelectedDay = format(selectedDate, 'yyyy-MM-dd') === dateStr;
                    
                    // Determinar el estado efectivo del día
                    const effectiveStatus = isPastDay ? 'past' : dayData.status;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            disabled={isPastDay} // Desactivar botón para días pasados
                            className={`
                                p-4 border rounded-lg transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-indigo-500
                                ${isPastDay ? 'cursor-not-allowed bg-gray-50' : 'hover:shadow-md hover:border-gray-300'}
                                ${isSelectedDay ? 'border-indigo-300 shadow-md bg-indigo-50/50' : ''}
                                ${isToday ? 'border-indigo-300 bg-indigo-50' : ''}
                                ${!isCurrentMonth && !isPastDay ? 'border-dashed border-gray-200' : ''}
                                h-auto aspect-square flex flex-col justify-between
                            `}
                        >
                            <div className="space-y-2 flex flex-col flex-1">
                                {/* Cabecera del día */}
                                <div className="text-center">
                                    {/* Nombre del día */}
                                    <p className={`
                                        text-sm font-medium capitalize
                                        ${isPastDay ? 'text-gray-400' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}
                                    `}>
                                        {format(day, 'EEEE', { locale: es })}
                                    </p>
                                    
                                    {/* Número del día con destacado para hoy */}
                                    <div className="flex justify-center my-1">
                                        <span className={`
                                            ${isToday ? 'bg-indigo-600 text-white' : ''}
                                            ${isSelectedDay && !isToday ? 'bg-indigo-100' : ''}
                                            w-8 h-8 flex items-center justify-center rounded-full
                                            text-xl font-bold
                                            ${isPastDay ? 'text-gray-400' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    
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
                                
                                {/* Estado de disponibilidad */}
                                <div className="flex justify-center flex-col items-center mt-auto">
                                    <StatusBadge
                                        status={effectiveStatus}
                                        interactive={false}
                                        dimmed={!isCurrentMonth && !isPastDay} // Días de otro mes se atenúan, pero los pasados tienen su propio estilo
                                    />
                                    
                                    {/* Contador de reservas si está disponible */}
                                    {dayData.reservas_count !== undefined && (
                                        <span className={`
                                            text-xs mt-2 px-2 py-1 rounded-full
                                            ${dayData.reservas_count > 0 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-gray-100 text-gray-800'}
                                        `}>
                                            {dayData.reservas_count} {dayData.reservas_count === 1 ? 'reserva' : 'reservas'}
                                        </span>
                                    )}
                                    
                                    {/* Etiqueta para horarios disponibles */}
                                    {dayData.horas_disponibles !== undefined && dayData.horas_disponibles > 0 && (
                                        <span className="text-xs text-green-600 mt-1 font-medium">
                                            {dayData.horas_disponibles}h disponibles
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* Panel de depuración (solo visible en desarrollo) */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
                <div className="p-2 mt-4 bg-blue-50 text-blue-700 rounded text-xs">
                    <details>
                        <summary className="font-bold cursor-pointer">Información de Depuración</summary>
                        <div className="mt-1 pl-2">
                            <div>Fecha de consulta: {debugInfo.fecha_consulta}</div>
                            <div>Tipo de espacio: {debugInfo.espacio_tipo}</div>
                            <div>Rango: {debugInfo.primera_fecha} a {debugInfo.ultima_fecha}</div>
                            <div>Datos disponibles: {debugInfo.data_count}</div>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

export default WeekView;