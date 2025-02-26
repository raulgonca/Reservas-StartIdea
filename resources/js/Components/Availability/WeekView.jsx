import React from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
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
    
    // Obtener todos los días de la semana actual
    const weekDays = eachDayOfInterval({
        start: startOfWeek(selectedDate, { locale: es }),
        end: endOfWeek(selectedDate, { locale: es })
    });

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
                    const dayData = weekData[dateStr] || { status: 'unavailable' };

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={`
                                p-4 border rounded-lg transition-all duration-200
                                hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                                ${format(selectedDate, 'yyyy-MM-dd') === dateStr ? 'border-indigo-200 shadow-sm' : 'hover:border-gray-300'}
                            `}
                        >
                            <div className="space-y-2">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-900">
                                        {format(day, 'EEEE', { locale: es })}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {format(day, 'd')}
                                    </p>
                                </div>
                                <div className="flex justify-center flex-col items-center">
                                    <StatusBadge
                                        status={dayData.status}
                                        interactive={false}
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