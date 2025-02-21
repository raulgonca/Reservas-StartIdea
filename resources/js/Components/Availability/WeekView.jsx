import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusColor, getStatusText } from './utils';
import { WEEKDAYS } from './constants';

/**
 * Componente para mostrar la disponibilidad semanal
 * @param {Object} props
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Object} props.availability - Datos de disponibilidad
 * @param {Function} props.onDateSelect - Función para seleccionar fecha
 * @param {string} props.selectedDesk - ID del escritorio seleccionado
 */
const WeekView = ({ selectedDate, availability, onDateSelect, selectedDesk }) => {
    const weekStart = startOfWeek(selectedDate, { locale: es });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    /**
     * Obtiene los datos de disponibilidad para un día específico
     */
    const getDayData = (dayStr) => {
        const dayData = availability?.weekAvailability?.[dayStr];
        
        if (selectedDesk) {
            // Si hay escritorio seleccionado, buscar sus datos específicos
            const deskData = dayData?.escritorios?.find(
                desk => desk.id.toString() === selectedDesk
            );
            return {
                status: deskData?.status || 'unknown',
                reservas: deskData?.reservas || [],
                occupancyPercentage: deskData?.occupancyPercentage || 0
            };
        }

        return {
            status: dayData?.status || 'unknown',
            reservas: dayData?.reservas || [],
            occupancyPercentage: dayData?.occupancyPercentage || 0
        };
    };

    return (
        <div className="space-y-4">
            {/* Información del escritorio seleccionado */}
            {selectedDesk && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        Mostrando disponibilidad del escritorio {
                            availability?.escritorios?.find(d => d.id.toString() === selectedDesk)?.numero
                        }
                    </p>
                </div>
            )}

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-2">
                {/* Cabecera de días */}
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center">
                        <span className="text-sm font-medium text-gray-500">
                            {day}
                        </span>
                    </div>
                ))}

                {/* Días de la semana */}
                {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const { status, reservas, occupancyPercentage } = getDayData(dayStr);
                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    
                    return (
                        <div 
                            key={dayStr}
                            onClick={() => onDateSelect(day)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                isToday ? 'bg-blue-50 border-blue-200' : 'hover:border-gray-300'
                            } ${
                                format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-gray-200'
                            }`}
                        >
                            {/* Número y nombre del día */}
                            <div className="text-center mb-2">
                                <span className={`text-sm font-medium ${
                                    isToday ? 'text-blue-700' : 'text-gray-900'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Indicador de estado */}
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`absolute top-0 left-0 h-full ${getStatusColor(status)}`}
                                    style={{ width: `${occupancyPercentage}%` }}
                                    title={getStatusText(status, occupancyPercentage)}
                                />
                            </div>

                            {/* Contador de reservas */}
                            {reservas.length > 0 && (
                                <div className="mt-2 text-center">
                                    <span className="text-xs text-gray-500">
                                        {reservas.length} reserva{reservas.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekView;