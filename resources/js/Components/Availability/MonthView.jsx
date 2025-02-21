import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusColor, getStatusText } from './utils';
import { WEEKDAYS } from './constants';

/**
 * Componente para mostrar la disponibilidad mensual
 * @param {Object} props 
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Object} props.availability - Datos de disponibilidad
 * @param {Function} props.onDateSelect - Función para seleccionar fecha
 * @param {string} props.selectedDesk - ID del escritorio seleccionado
 */
const MonthView = ({ selectedDate, availability, onDateSelect, selectedDesk }) => {
    // Obtener todos los días del mes actual y completar semanas
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { locale: es });
    const calendarEnd = endOfWeek(monthEnd, { locale: es });

    // Crear array con todas las fechas a mostrar
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    // Agrupar días en semanas
    const weeks = [];
    let currentWeek = [];
    
    days.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    /**
     * Obtiene los datos de disponibilidad para un día específico
     * @param {string} dayStr - Fecha en formato YYYY-MM-DD
     * @returns {Object} Datos de disponibilidad del día
     */
    const getDayData = (dayStr) => {
        const dayData = availability?.monthAvailability?.[dayStr];
        
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

    /**
     * Maneja el click en un día
     * @param {Date} day - Día seleccionado
     * @param {boolean} isCurrentMonth - Indica si el día pertenece al mes actual
     */
    const handleDayClick = (day, isCurrentMonth) => {
        if (isCurrentMonth) {
            onDateSelect(day);
            console.log('Día seleccionado:', format(day, 'dd/MM/yyyy'));
        }
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

            {/* Cabecera con días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid del calendario */}
            <div className="space-y-2">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                        {week.map((day) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const isCurrentMonth = format(day, 'M') === format(selectedDate, 'M');
                            const isToday = isSameDay(day, new Date());
                            const isSelected = isSameDay(day, selectedDate);
                            const { status, reservas, occupancyPercentage } = getDayData(dayStr);

                            return (
                                <div 
                                    key={dayStr}
                                    onClick={() => handleDayClick(day, isCurrentMonth)}
                                    className={`p-2 border rounded cursor-pointer transition-all
                                        ${!isCurrentMonth && 'opacity-40 cursor-not-allowed'}
                                        ${isToday && 'bg-blue-50 border-blue-200'}
                                        ${isSelected
                                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {/* Número del día */}
                                    <div className="text-right mb-2">
                                        <span className={`text-sm font-medium ${
                                            isToday ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {/* Indicador de estado */}
                                    <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`absolute top-0 left-0 h-full ${getStatusColor(status)}`}
                                            style={{ 
                                                width: '100%'
                                            }}
                                            title={getStatusText(status, occupancyPercentage, reservas)}
                                        />
                                    </div>

                                    {/* Indicador de ocupación */}
                                    {isCurrentMonth && status === 'partial' && (
                                        <div className="mt-1 text-xs text-yellow-600 text-center">
                                            {Math.round(occupancyPercentage)}%
                                        </div>
                                    )}

                                    {/* Contador de reservas activas */}
                                    {isCurrentMonth && reservas.filter(r => 
                                        ['confirmada', 'pendiente'].includes(r?.estado)
                                    ).length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500 text-center">
                                            {reservas.filter(r => 
                                                ['confirmada', 'pendiente'].includes(r?.estado)
                                            ).length} reserva(s)
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthView;