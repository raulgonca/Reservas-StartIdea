import React from 'react';

/**
 * Componente que muestra la leyenda de estados de disponibilidad
 */
const Legend = () => {
    const states = [
        { id: 'free', label: 'Disponible', color: 'bg-green-500' },
        { id: 'partial', label: 'Parcialmente ocupado', color: 'bg-yellow-500' },
        { id: 'occupied', label: 'Ocupado', color: 'bg-red-500' },
        { id: 'unavailable', label: 'No disponible', color: 'bg-gray-300' }
    ];

    return (
        <div className="flex flex-wrap gap-4">
            {states.map(state => (
                <div key={state.id} className="flex items-center space-x-2">
                    <div 
                        className={`w-3 h-3 rounded-full ${state.color}`}
                        title={state.label}
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