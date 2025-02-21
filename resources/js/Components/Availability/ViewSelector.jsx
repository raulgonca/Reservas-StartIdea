import React from 'react';
import { VIEW_MODES } from './utils';

/**
 * Componente para seleccionar el modo de visualización
 * @param {Object} props
 * @param {string} props.viewMode - Modo de vista actual
 * @param {Function} props.onViewChange - Función para cambiar el modo de vista
 */
const ViewSelector = ({ viewMode, onViewChange }) => {
    const views = [
        { id: VIEW_MODES.DAY, label: 'Día' },
        { id: VIEW_MODES.WEEK, label: 'Semana' },
        { id: VIEW_MODES.MONTH, label: 'Mes' }
    ];

    return (
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
            {views.map(view => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${viewMode === view.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                    `}
                >
                    {view.label}
                </button>
            ))}
        </div>
    );
};

export default ViewSelector;