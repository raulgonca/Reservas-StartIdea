import React from 'react';

export default function SelectInput({ name, value, onChange, children, className }) {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:ring-indigo-500 mt-1 block w-full ${className}`}
        >
            {children}
        </select>
    );
}