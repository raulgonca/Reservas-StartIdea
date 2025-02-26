import React, { useState } from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';

/**
 * Componente CalendarContainer - Gestiona las diferentes vistas del calendario
 * @param {Object} props
 * @param {Object} props.escritorios - Datos de escritorios
 * @param {Object} props.weekData - Datos de disponibilidad semanal
 * @param {Object} props.monthData - Datos de disponibilidad mensual
 * @returns {JSX.Element}
 */
const CalendarContainer = ({ escritorios, weekData, monthData }) => {
    // Estado para la fecha seleccionada y el tipo de vista
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewType, setViewType] = useState('day'); // 'day', 'week', 'month'

    // Manejador para cambio de día
    const handleDayClick = (date) => {
        setSelectedDate(date);
        setViewType('day');
    };

    // Selector de vista actual
    const renderCurrentView = () => {
        switch (viewType) {
            case 'week':
                return (
                    <WeekView 
                        selectedDate={selectedDate}
                        onDayClick={handleDayClick}
                        weekData={weekData}
                    />
                );
            case 'month':
                return (
                    <MonthView 
                        selectedDate={selectedDate}
                        onDayClick={handleDayClick}
                        monthData={monthData}
                    />
                );
            default:
                return (
                    <DayView 
                        selectedDate={selectedDate}
                        escritorios={escritorios}
                    />
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Selector de tipo de vista */}
            <div className="flex justify-center space-x-4">
                {['day', 'week', 'month'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setViewType(type)}
                        className={`
                            px-4 py-2 rounded-lg transition-all duration-200
                            ${viewType === type 
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'}
                        `}
                    >
                        {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : 'Mes'}
                    </button>
                ))}
            </div>

            {/* Vista actual del calendario */}
            {renderCurrentView()}
        </div>
    );
};

export default CalendarContainer;