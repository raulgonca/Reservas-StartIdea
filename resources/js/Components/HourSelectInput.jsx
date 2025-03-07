import React from 'react';
import { HORAS_DISPONIBLES } from '@/config/horarios';

/**
 * Componente para seleccionar una hora dentro del rango configurado (08:00-22:00)
 * Utiliza la configuración centralizada de horarios
 */
export default function HourSelectInput({ 
    id,
    name, 
    value, 
    onChange, 
    className = '', 
    label = null,
    error = null,
    required = false,
    disabled = false,
    placeholder = "Seleccione una hora",
    ...props 
}) {
    // Renderizar etiqueta si se proporciona
    const renderLabel = () => {
        if (!label) return null;
        
        return (
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
        );
    };

    // Renderizar mensaje de error si se proporciona
    const renderError = () => {
        if (!error) return null;
        
        return (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        );
    };

    return (
        <div>
            {renderLabel()}
            
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:ring-indigo-500 mt-1 block w-full ${className}`}
                disabled={disabled}
                required={required}
                {...props}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {HORAS_DISPONIBLES.map(hour => (
                    <option key={hour} value={hour}>
                        {hour}
                    </option>
                ))}
            </select>
            
            {renderError()}
        </div>
    );
}