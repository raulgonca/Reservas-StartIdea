import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function DateNavigator({ currentDate, view, onDateChange }) {
    // Función para formatear la fecha según el tipo de vista
    const getFormattedDate = () => {
        const date = new Date(currentDate);

        // Opciones para formatear fechas en español
        const dayOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const monthOptions = { month: 'long', year: 'numeric' };
        
        switch (view) {
            case 'day':
                return date.toLocaleDateString('es-ES', dayOptions);
            case 'week':
                // Para vista semanal, mostrar el rango de la semana
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay() + 1); // Lunes
                
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6); // Domingo
                
                return `Semana del ${weekStart.getDate()} de ${weekStart.toLocaleDateString('es-ES', { month: 'long' })}`;
            case 'month':
                return date.toLocaleDateString('es-ES', monthOptions);
            default:
                return date.toLocaleDateString('es-ES');
        }
    };

    // Navegar al día, semana o mes anterior
    const handlePrevious = () => {
        const date = new Date(currentDate);
        
        switch (view) {
            case 'day':
                date.setDate(date.getDate() - 1);
                break;
            case 'week':
                date.setDate(date.getDate() - 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() - 1);
                break;
        }
        
        onDateChange(date.toISOString().split('T')[0]);
    };

    // Navegar al día, semana o mes siguiente
    const handleNext = () => {
        const date = new Date(currentDate);
        
        switch (view) {
            case 'day':
                date.setDate(date.getDate() + 1);
                break;
            case 'week':
                date.setDate(date.getDate() + 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() + 1);
                break;
        }
        
        onDateChange(date.toISOString().split('T')[0]);
    };

    // Navegar al día actual
    const handleToday = () => {
        const today = new Date();
        onDateChange(today.toISOString().split('T')[0]);
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