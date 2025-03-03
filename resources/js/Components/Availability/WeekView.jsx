import React from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isBefore, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';
import Legend from './Legend';

/**
 * Componente WeekView - Muestra la disponibilidad semanal de un espacio
 * 
 * Este componente renderiza un calendario semanal con la disponibilidad de cada
 * día, permitiendo al usuario ver de forma rápida qué días están disponibles,
 * parcialmente ocupados o no disponibles durante la semana seleccionada.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Date} props.selectedDate - Fecha seleccionada para determinar la semana a mostrar
 * @param {Function} props.onDayClick - Función a ejecutar al hacer clic en un día
 * @param {Object} props.weekData - Datos de disponibilidad de la semana indexados por fecha YYYY-MM-DD
 * @returns {JSX.Element} - Componente de visualización semanal
 */
const WeekView = ({ selectedDate, onDayClick, weekData = {} }) => {
    // Verificar si tenemos datos de disponibilidad
    const hasData = Object.keys(weekData).length > 0;
    
    // Fecha actual para comparar días pasados
    const today = startOfDay(new Date());
    
    // Obtener todos los días de la semana actual, empezando el lunes
    const weekDays = eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }), // Lunes como primer día
        end: endOfWeek(selectedDate, { weekStartsOn: 1 })      // Domingo como último día
    });

    // Obtener el mes actual para comparación visual
    const currentMonth = selectedDate.getMonth();

    return (
        <div className="space-y-4">
            {/* Título de la semana y leyenda - Con layout flexible */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize py-2 px-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    {/* Mostrar el rango de fechas de la semana (adaptativo si cruza meses) */}
                    {format(weekDays[0], "'Semana del' d 'de' MMMM", { locale: es })}
                    {format(weekDays[0], 'MMM', { locale: es }) !== format(weekDays[6], 'MMM', { locale: es }) && 
                        ` al ${format(weekDays[6], "d 'de' MMMM", { locale: es })}`}
                </h3>
                
                {/* Leyenda integrada para explicar códigos de color */}
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm sm:w-auto w-full">
                    <Legend />
                </div>
            </div>
            
            {/* Mostrar advertencia si no hay datos de disponibilidad */}
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

            {/* Grid de días con diseño responsive: 2 columnas en móviles, 4 en tablets, 7 en desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                    // Formatear fecha para buscar datos en el objeto weekData
                    const dateStr = format(day, 'yyyy-MM-dd');
                    
                    // Usar disponibilidad real o 'unavailable' como predeterminado cuando no hay datos
                    const dayData = weekData[dateStr] || { status: 'unavailable' };
                    
                    // Determinar varios estados visuales del día
                    const isCurrentMonth = isSameMonth(day, selectedDate);
                    const isToday = isSameDay(day, today);
                    const isPastDay = isBefore(day, today) && !isToday;
                    const isSelectedDay = format(selectedDate, 'yyyy-MM-dd') === dateStr;
                    
                    // Estado efectivo considerando si es un día pasado
                    const effectiveStatus = isPastDay ? 'past' : dayData.status;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            disabled={isPastDay} // Desactivar interacción para días pasados
                            className={`
                                p-4 border rounded-lg transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-indigo-500
                                ${isPastDay ? 'cursor-not-allowed bg-gray-50' : 'hover:shadow-md hover:border-gray-300'}
                                ${isSelectedDay ? 'border-indigo-300 shadow-md bg-indigo-50/50' : ''}
                                ${isToday ? 'border-indigo-300 bg-indigo-50' : ''}
                                ${!isCurrentMonth && !isPastDay ? 'border-dashed border-gray-200' : ''}
                                h-auto aspect-square flex flex-col justify-between
                            `}
                            aria-label={`Ver disponibilidad para ${format(day, "EEEE d 'de' MMMM", { locale: es })}`}
                        >
                            <div className="space-y-2 flex flex-col flex-1">
                                {/* Cabecera con información del día */}
                                <div className="text-center">
                                    {/* Nombre del día de la semana */}
                                    <p className={`
                                        text-sm font-medium capitalize
                                        ${isPastDay ? 'text-gray-400' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}
                                    `}>
                                        {format(day, 'EEEE', { locale: es })}
                                    </p>
                                    
                                    {/* Número del día con destacado visual para hoy */}
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
                                    
                                    {/* Mostrar el mes si el día pertenece a un mes diferente */}
                                    {!isCurrentMonth && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(day, 'MMMM', { locale: es })}
                                        </p>
                                    )}
                                    
                                    {/* Etiqueta especial para el día actual */}
                                    {isToday && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 mt-1">
                                            Hoy
                                        </span>
                                    )}
                                </div>
                                
                                {/* Sección de estado de disponibilidad */}
                                <div className="flex justify-center flex-col items-center mt-auto">
                                    {/* Badge visual de estado */}
                                    <StatusBadge
                                        status={effectiveStatus}
                                        interactive={false}
                                        dimmed={!isCurrentMonth && !isPastDay} // Días de otro mes se atenúan, los pasados tienen estilo propio
                                    />
                                    
                                    {/* Contador de reservas existentes */}
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
                                    
                                    {/* Indicador de horas disponibles */}
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
        </div>
    );
};

export default WeekView;