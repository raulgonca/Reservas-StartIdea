import React from 'react';

/**
 * Componente StatusBadge - Muestra el estado de disponibilidad con colores intuitivos
 * @param {Object} props
 * @param {string} props.status - Estado de disponibilidad: 'free', 'partial', 'occupied', 'unavailable', 'past', 'reserved'
 * @param {boolean} props.interactive - Si el badge debe tener efectos de hover
 * @param {boolean} props.dimmed - Si el badge debe mostrarse con estilo atenuado (para días fuera del mes actual)
 * @returns {JSX.Element}
 */
const StatusBadge = ({ status, interactive = true, dimmed = false }) => {
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
            label = 'Parcialmente-ocupado';
            break;
        case 'occupied':
        case 'reserved': 
            bgColor = 'bg-red-200';
            textColor = 'text-red-800';
            hoverBg = 'hover:bg-red-200';
            label = 'Ocupado';
            break;
        case 'past':
            // Estilo especial para días pasados
            bgColor = 'bg-gray-200';
            textColor = 'text-gray-500';
            hoverBg = '';
            label = 'Fecha pasada';
            break;
        default: // unavailable
            bgColor = 'bg-gray-300';
            textColor = 'text-gray-600';
            hoverBg = 'hover:bg-gray-300';
            label = '------------- ';
    }

    // Si es un día pasado, siempre aplicamos estilos especiales
    if (status === 'past') {
        return (
            <span className={`
                px-2 py-1 text-[0.65rem] font-medium rounded-lg
                bg-gray-200 text-gray-500 line-through
                border border-gray-300
            `}
            title="Esta fecha ya ha pasado y no está disponible para reserva"
            >
                {label}
            </span>
        );
    }

    // Si está atenuado (dimmed), aplicar estilos adicionales para diferenciarlo
    if (dimmed) {
        // Modificar clases para mostrar un estilo atenuado pero preservando el color base
        bgColor = bgColor.replace('bg-', 'bg-opacity-50 bg-');
        textColor = textColor.replace('text-', 'text-opacity-15 text-');
        
        // Añadir borde punteado para indicar visualmente que es de otro mes
        const borderStyle = 'border border-dashed border-gray-500';
        
        return (
            <span className={`
                px-2 py-1 text-[0.65rem] font-medium rounded-lg transition-colors duration-200
                ${bgColor} ${textColor} ${interactive ? hoverBg : ''}
                ${interactive ? 'cursor-default' : ''}
                ${borderStyle}
            `}
            title={`Estado: ${label} (Fuera del mes actual)`}
            >
                {label}
            </span>
        );
    }

    return (
        <span className={`
            px-2 py-1 text-[0.65rem] font-medium rounded-md transition-colors duration-200
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