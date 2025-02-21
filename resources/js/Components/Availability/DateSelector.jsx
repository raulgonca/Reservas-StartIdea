import React from 'react';
import { format, addMonths, addWeeks, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { VIEW_MODES } from './utils';

/**
 * Componente para seleccionar y navegar entre fechas
 * @param {Object} props
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Function} props.onDateChange - Función para cambiar la fecha
 * @param {string} props.viewMode - Modo de vista actual
 */
const DateSelector = ({ selectedDate, onDateChange, viewMode }) => {
    const getDisplayText = () => {
        switch (viewMode) {
            case VIEW_MODES.DAY:
                return format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es });
            case VIEW_MODES.WEEK: {
                const start = startOfWeek(selectedDate, { locale: es });
                const end = endOfWeek(selectedDate, { locale: es });
                return `${format(start, "d 'de' MMMM", { locale: es })} - ${format(end, "d 'de' MMMM, yyyy", { locale: es })}`;
            }
            case VIEW_MODES.MONTH:
                return format(selectedDate, "MMMM 'de' yyyy", { locale: es });
            default:
                return '';
        }
    };

    const handlePrevious = () => {
        switch (viewMode) {
            case VIEW_MODES.DAY:
                onDateChange(addDays(selectedDate, -1));
                break;
            case VIEW_MODES.WEEK:
                onDateChange(addWeeks(selectedDate, -1));
                break;
            case VIEW_MODES.MONTH:
                onDateChange(addMonths(selectedDate, -1));
                break;
        }
    };

    const handleNext = () => {
        switch (viewMode) {
            case VIEW_MODES.DAY:
                onDateChange(addDays(selectedDate, 1));
                break;
            case VIEW_MODES.WEEK:
                onDateChange(addWeeks(selectedDate, 1));
                break;
            case VIEW_MODES.MONTH:
                onDateChange(addMonths(selectedDate, 1));
                break;
        }
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {/* Navegación */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevious}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        title="Anterior"
                    >
                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        title="Siguiente"
                    >
                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Texto de fecha actual */}
                <span className="text-lg font-medium text-gray-900">
                    {getDisplayText()}
                </span>
            </div>

            {/* Botón Hoy */}
            <button
                onClick={handleToday}
                className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
                Hoy
            </button>
        </div>
    );
};

export default DateSelector;