import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, parseISO, startOfWeek, endOfWeek, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente DateNavigator - Maneja la navegación de fechas en el calendario
 * 
 * Este componente proporciona una interfaz de navegación para moverse entre diferentes
 * fechas en el calendario. Muestra la fecha actual formateada según el tipo de vista
 * (día, semana, mes) y botones para navegar hacia adelante, atrás o ir a hoy.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Date|string} props.currentDate - Fecha actual (objeto Date o string formato ISO YYYY-MM-DD)
 * @param {string} props.view - Tipo de vista actual ('day', 'week', 'month')
 * @param {Function} props.onDateChange - Función para cambiar directamente a una fecha específica
 * @param {Function} props.onPrevious - Función para navegar a la fecha anterior
 * @param {Function} props.onNext - Función para navegar a la fecha siguiente
 * @param {Function} props.onToday - Función para navegar a la fecha actual
 * @returns {JSX.Element} - Componente de navegación de fechas
 */
export default function DateNavigator({ 
    currentDate, 
    view, 
    onDateChange,
    onPrevious = null,
    onNext = null, 
    onToday = null
}) {
    // Parsear la fecha actual a objeto Date, manejando diferentes formatos posibles
    const date = React.useMemo(() => {
        // Si ya es un objeto Date, usarlo directamente
        if (currentDate instanceof Date && isValid(currentDate)) {
            return currentDate;
        }
        
        // Si es una string en formato ISO, parsearla
        if (typeof currentDate === 'string') {
            try {
                const parsedDate = parseISO(currentDate);
                if (isValid(parsedDate)) {
                    return parsedDate;
                }
            } catch (error) {
                // Silenciar error, usar fecha actual como fallback
            }
        }
        
        // Por defecto, usar la fecha actual
        return new Date();
    }, [currentDate]);

    /**
     * Formatea la fecha según el tipo de vista (día, semana o mes)
     * @returns {string} Fecha formateada para mostrar en la interfaz
     */
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
                    // Formato: "Enero de 2023"
                    return format(date, "MMMM 'de' yyyy", { locale: es });
                    
                default:
                    return format(date, "d MMMM yyyy", { locale: es });
            }
        } catch (error) {
            // En caso de error de formateo, mostrar mensaje genérico
            return 'Fecha no válida';
        }
    };

    /**
     * Maneja la navegación hacia la fecha anterior
     * Usa la función proporcionada o implementa un comportamiento predeterminado
     */
    const handlePrevious = () => {
        if (onPrevious) {
            onPrevious();
        } else {
            // Fallback a la implementación interna si no se proporciona onPrevious
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
            
            onDateChange(newDate);
        }
    };

    /**
     * Maneja la navegación hacia la fecha siguiente
     * Usa la función proporcionada o implementa un comportamiento predeterminado
     */
    const handleNext = () => {
        if (onNext) {
            onNext();
        } else {
            // Fallback a la implementación interna si no se proporciona onNext
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
            
            onDateChange(newDate);
        }
    };

    /**
     * Maneja la navegación hacia la fecha actual (hoy)
     * Usa la función proporcionada o implementa un comportamiento predeterminado
     */
    const handleToday = () => {
        if (onToday) {
            onToday();
        } else {
            // Fallback a la implementación interna si no se proporciona onToday
            onDateChange(new Date());
        }
    };

    return (
        <div className="flex items-center justify-between mb-4 px-2 py-3 bg-white rounded-lg shadow">
            {/* Botones de navegación */}
            <div className="flex space-x-2">
                {/* Botón para ir a la fecha anterior */}
                <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Anterior"
                >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Botón para ir a la fecha siguiente */}
                <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Siguiente"
                >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Botón para ir a la fecha actual (hoy) */}
                <button
                    onClick={handleToday}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                    Hoy
                </button>
            </div>
            
            {/* Título con fecha formateada */}
            <h2 className="text-lg font-medium text-gray-800 capitalize">
                {getFormattedDate()}
            </h2>
            
            {/* Espacio vacío para equilibrar el diseño en flexbox */}
            <div className="w-24" aria-hidden="true">
                {/* Espacio vacío para equilibrar el diseño */}
            </div>
        </div>
    );
}