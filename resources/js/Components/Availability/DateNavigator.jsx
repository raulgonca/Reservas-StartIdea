import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente que maneja la navegación de fechas en el calendario
 * @param {Object} props
 * @param {string} props.currentDate - Fecha actual en formato ISO (YYYY-MM-DD)
 * @param {string} props.view - Tipo de vista actual ('day', 'week', 'month')
 * @param {Function} props.onDateChange - Función para cambiar directamente a una fecha específica
 * @param {Function} props.onPrevious - Función para navegar a la fecha anterior
 * @param {Function} props.onNext - Función para navegar a la fecha siguiente
 * @param {Function} props.onToday - Función para navegar a la fecha actual
 * @returns {JSX.Element}
 */
export default function DateNavigator({ 
    currentDate, 
    view, 
    onDateChange,
    onPrevious = null,
    onNext = null, 
    onToday = null
}) {
    // Parsear la fecha actual a objeto Date
    const date = currentDate ? parseISO(currentDate) : new Date();

    // Función para formatear la fecha según el tipo de vista
    const getFormattedDate = () => {
        try {
            switch (view) {
                case 'day':
                    // Formato: "Lunes, 10 de enero de 2023"
                    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
                    
                case 'week':
                    // Para vista semanal, mostrar el rango de la semana
                    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Lunes
                    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Domingo
                    
                    // Si el inicio y fin están en el mismo mes
                    if (format(weekStart, 'MMMM', { locale: es }) === format(weekEnd, 'MMMM', { locale: es })) {
                        return `${format(weekStart, "d", { locale: es })} - ${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
                    }
                    
                    // Si están en meses diferentes
                    return `${format(weekStart, "d 'de' MMMM", { locale: es })} - ${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
                    
                case 'month':
                    // Formato: "Enero 2023"
                    return format(date, "MMMM 'de' yyyy", { locale: es });
                    
                default:
                    return format(date, "d MMMM yyyy", { locale: es });
            }
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no válida';
        }
    };

    // Manejadores de eventos que utilizan las funciones pasadas como props
    const handlePrevious = () => {
        if (onPrevious) {
            onPrevious();
        } else {
            // Fallback a la implementación anterior si no se proporciona onPrevious
            const newDate = new Date(date);
            
            switch (view) {
                case 'day':
                    newDate.setDate(newDate.getDate() - 1);
                    break;
                case 'week':
                    newDate.setDate(newDate.getDate() - 7);
                    break;
                case 'month':
                    newDate.setMonth(newDate.getMonth() - 1);
                    break;
            }
            
            onDateChange(newDate.toISOString().split('T')[0]);
        }
    };

    const handleNext = () => {
        if (onNext) {
            onNext();
        } else {
            // Fallback a la implementación anterior si no se proporciona onNext
            const newDate = new Date(date);
            
            switch (view) {
                case 'day':
                    newDate.setDate(newDate.getDate() + 1);
                    break;
                case 'week':
                    newDate.setDate(newDate.getDate() + 7);
                    break;
                case 'month':
                    newDate.setMonth(newDate.getMonth() + 1);
                    break;
            }
            
            onDateChange(newDate.toISOString().split('T')[0]);
        }
    };

    const handleToday = () => {
        if (onToday) {
            onToday();
        } else {
            // Fallback a la implementación anterior si no se proporciona onToday
            const today = new Date();
            onDateChange(today.toISOString().split('T')[0]);
        }
    };

    return (
        <div className="flex items-center justify-between mb-4 px-2 py-3 bg-white rounded-lg shadow">
            <div className="flex space-x-2">
                <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Anterior"
                >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Siguiente"
                >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                <button
                    onClick={handleToday}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                    Hoy
                </button>
            </div>
            
            <h2 className="text-lg font-medium text-gray-800 capitalize">
                {getFormattedDate()}
            </h2>
            
            <div className="w-24">
                {/* Espacio vacío para equilibrar el diseño */}
            </div>
        </div>
    );
}