import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * Componente SlotList - Muestra la lista de slots horarios
 * @param {Object} props
 * @param {Array} props.slots - Lista de slots horarios
 * @param {boolean} props.isCompact - Modo compacto para vistas reducidas
 * @returns {JSX.Element}
 */
const SlotList = ({ slots = [], isCompact = false }) => {
    // Función para determinar el estado del slot
    const getSlotStatus = (slot) => {
        if (slot.status === 'unavailable') return 'unavailable';
        if (slot.status === 'partial') return 'partial';
        if (slot.status === 'occupied') return 'occupied';
        return 'free';
    };

    if (!slots.length) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                    No hay horarios disponibles
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {slots.map((slot, index) => (
                <div 
                    key={index}
                    className={`
                        flex justify-between items-center
                        ${isCompact ? 'p-2' : 'p-3'}
                        bg-gray-50 rounded-md hover:bg-gray-100 transition-colors
                    `}
                >
                    <span className="text-sm text-gray-600">
                        {slot.hora_inicio} - {slot.hora_fin}
                    </span>
                    <StatusBadge 
                        status={getSlotStatus(slot)} 
                        interactive={false}
                    />
                </div>
            ))}
        </div>
    );
};

export default SlotList;