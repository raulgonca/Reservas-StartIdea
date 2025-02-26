import React from 'react';

/**
 * Componente StatusBadge - Muestra el estado de disponibilidad con colores intuitivos
 * @param {Object} props
 * @param {string} props.status - Estado de disponibilidad: 'free', 'partial', 'occupied', 'unavailable'
 * @param {boolean} props.interactive - Si el badge debe tener efectos de hover
 * @returns {JSX.Element}
 */
const StatusBadge = ({ status, interactive = true }) => {
    let bgColor, textColor, hoverBg, label;
    
    // Determinar colores y etiquetas según el estado
    switch (status) {
        case 'free':
            bgColor = 'bg-green-200';
            textColor = 'text-green-800';
            hoverBg = 'hover:bg-green-200';
            label = 'Disponible';
            break;
        case 'partial':
            bgColor = 'bg-yellow-200';
            textColor = 'text-yellow-800';
            hoverBg = 'hover:bg-yellow-200';
            label = 'Parcialmente ocupado';
            break;
        case 'occupied':
            bgColor = 'bg-red-200';
            textColor = 'text-red-800';
            hoverBg = 'hover:bg-red-200';
            label = 'No Disponible';
            break;
        default: // unavailable
            bgColor = 'bg-gray-300';
            textColor = 'text-gray-600';
            hoverBg = 'hover:bg-gray-300';
            label = 'No Disponible';
    }

    return (
        <span className={`
            px-2 py-1 text-xs font-medium rounded-lg transition-colors duration-200
            ${bgColor} ${textColor} ${interactive ? hoverBg : ''}
            ${interactive ? 'cursor-default' : ''}
        `}
        title={`Estado: ${label}`}
        >
            {label}
        </span>
    );
};

export default StatusBadge;