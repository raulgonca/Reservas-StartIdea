import React from 'react';
import { 
    format, 
    eachDayOfInterval, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek,
    endOfWeek,
    isSameMonth 
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
                    week.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayData = monthData[dateStr] || { status: 'unavailable' };
                        const isCurrentMonth = isSameMonth(day, selectedDate);

                        return (
                            <button
                                key={dateStr}
                                onClick={() => onDayClick(day)}
                                disabled={!isCurrentMonth}
                                className={`
                                    p-2 bg-white transition-all duration-200 relative
                                    hover:z-10 focus:z-10
                                    ${!isCurrentMonth ? 'opacity-50' : 'hover:shadow-lg'}
                                    ${selectedDate === day ? 'ring-2 ring-indigo-500 z-10' : ''}
                                `}
                            >
                                <div className="space-y-1">
                                    <p className={`
                                        text-sm font-medium
                                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                    `}>
                                        {format(day, 'd')}
                                    </p>
                                    <div className="flex justify-center">
                                        <StatusBadge 
                                            status={dayData.status}
                                            interactive={false}
                                        />
                                    </div>
                                </div>
                            </button>
                        );
                    })
                ))}
            </div>
        </div>
    );
};

export default MonthView;