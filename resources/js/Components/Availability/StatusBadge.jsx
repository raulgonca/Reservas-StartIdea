import React from 'react';

/**
 * Componente StatusBadge - Muestra el estado de disponibilidad
 * @param {Object} props
 * @param {string} props.status - Estado actual ('free', 'partial', 'occupied', 'unavailable')
 * @param {boolean} props.interactive - Habilita efectos hover
 * @returns {JSX.Element}
 */
const StatusBadge = ({ status, interactive = true }) => {
    const statusConfig = {
        free: {
            base: 'bg-green-100 text-green-800',
            hover: 'group-hover:bg-green-200',
            label: 'Disponible'
        },
        partial: {
            base: 'bg-yellow-100 text-yellow-800',
            hover: 'group-hover:bg-yellow-200',
            label: 'Parcialmente ocupado'
        },
        occupied: {
            base: 'bg-red-100 text-red-800',
            hover: 'group-hover:bg-red-200',
            label: 'Ocupado'
        },
        unavailable: {
            base: 'bg-gray-100 text-gray-800',
            hover: 'group-hover:bg-gray-200',
            label: 'No Disponible'
        }
    };

    const config = statusConfig[status] || statusConfig.unavailable;

    return (
        <span className={`
            px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200
            ${config.base}
            ${interactive ? config.hover : ''}
        `}>
            {config.label}
        </span>
    );
};

export default StatusBadge;