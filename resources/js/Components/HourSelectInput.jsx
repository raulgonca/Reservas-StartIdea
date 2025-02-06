import React from 'react';

export default function HourSelectInput({ name, value, onChange, className = '', ...props }) {
    const hours = Array.from({ length: 24 }, (_, i) => i).map(hour => {
        const hourString = hour.toString().padStart(2, '0');
        return `${hourString}:00`;
    });

    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:ring-indigo-500 mt-1 block w-full ${className}`}
            {...props}
        >
            <option value="" disabled hidden>
                Seleccione una hora
            </option>
            {hours.map(hour => (
                <option key={hour} value={hour}>
                    {hour}
                </option>
            ))}
        </select>
    );
}