import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar la vista de escritorios
 * @param {Object} props
 * @param {Array} props.escritorios - Lista de escritorios con su disponibilidad
 */
const DeskView = ({ escritorios = [] }) => {
    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
            {escritorios.map((desk) => (
                <div
                    key={desk.id}
                    className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        desk.disponible 
                            ? 'bg-green-50 border-green-200 hover:border-green-300' 
                            : 'bg-red-50 border-red-200 hover:border-red-300'
                    }`}
                >
                    <div className="text-sm sm:text-base font-medium mb-1 sm:mb-2">
                        Escritorio {desk.numero}
                    </div>
                    <div className={`text-xs sm:text-sm ${
                        desk.disponible 
                            ? 'text-green-700' 
                            : 'text-red-700'
                    }`}>
                        {desk.disponible ? 'Disponible' : 'Ocupado'}
                    </div>
                </div>
            ))}
        </div>
    );
};

DeskView.propTypes = {
    escritorios: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            numero: PropTypes.number.isRequired,
            disponible: PropTypes.bool.isRequired
        })
    )
};

export default DeskView;