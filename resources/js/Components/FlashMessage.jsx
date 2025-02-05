import React from 'react';

export default function FlashMessage({ message, type = 'success', className = '', ...props }) {
    const baseClass = 'text-sm ';
    const typeClass = type === 'success' ? 'text-green-600 dark:text-green-400 ' : 'text-red-600 dark:text-red-400 ';
    
    return message ? (
        <p
            {...props}
            className={baseClass + typeClass + className}
        >
            {message}
        </p>
    ) : null;
}