import React from 'react';

/**
 * Componente Legend - Muestra la leyenda de estados de disponibilidad
 * 
 * Este componente renderiza una lista de indicadores visuales que explican 
 * el significado de los diferentes colores utilizados para representar 
 * los estados de disponibilidad en el calendario.
 * 
 * @returns {JSX.Element} Componente de leyenda con indicadores de colores
 */
const Legend = () => {
    // Definición de los diferentes estados y sus representaciones visuales
    const states = [
        { id: 'free', label: 'Disponible', color: 'bg-green-500' },
        { id: 'partial', label: 'Parcialmente ocupado', color: 'bg-yellow-500' },
        { id: 'occupied', label: 'Ocupado', color: 'bg-red-500' },
        { id: 'past', label: 'Fecha pasada', color: 'bg-gray-400' },
        { id: 'unavailable', label: 'No disponible', color: 'bg-gray-300' }
    ];

    return (
        <div className="flex flex-wrap gap-4">
            {states.map(state => (
                <div 
                    key={state.id} 
                    className="flex items-center space-x-2"
                    role="presentation"
                >
                    <div 
                        className={`w-3 h-3 rounded-full ${state.color}`}
                        title={`Estado: ${state.label}`}
                        aria-hidden="true"
                    />
                    <span className="text-sm text-gray-600">
                        {state.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Legend;