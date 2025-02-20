import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente que muestra la disponibilidad de escritorios y slots de tiempo
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.space - Datos del espacio incluyendo tipo y configuración
 */
const SpaceAvailability = ({ space }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availability, setAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await axios.get(`/v1/espacios/${space.id}/availability`, {
                    params: {
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        tipo: space.tipo
                    }
                });
                setAvailability(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error al cargar disponibilidad:', error);
                setIsLoading(false);
            }
        };

        fetchAvailability();
    }, [space.id, selectedDate, space.tipo]);

    // Renderizado condicional con optimizaciones responsive
    const renderContent = () => {
        if (space.tipo === 'coworking' && availability?.escritorios) {
            return (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                    {availability.escritorios.map((desk) => (
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
        }

        // Para otros tipos de espacios - Vista de slots horarios
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {availability?.slots?.map((slot) => (
                    <div
                        key={slot.time}
                        className={`p-2 sm:p-3 rounded-md text-center transition-all duration-200 hover:shadow-md ${
                            slot.isAvailable 
                                ? 'bg-green-50 text-green-800 border border-green-200 hover:border-green-300' 
                                : 'bg-red-50 text-red-800 border border-red-200 hover:border-red-300'
                        }`}
                    >
                        <span className="text-xs sm:text-sm md:text-base font-medium">
                            {slot.time}
                        </span>
                        <span className="block text-[10px] sm:text-xs mt-1">
                            {slot.isAvailable ? 'Disponible' : 'Ocupado'}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="mt-4 sm:mt-6">
            <div className="mb-3 sm:mb-4">
                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                    {space.tipo === 'coworking' ? 'Escritorios Disponibles' : 'Disponibilidad'}
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm 
                                 text-sm sm:text-base
                                 focus:border-blue-300 focus:ring focus:ring-blue-200 
                                 focus:ring-opacity-50"
                        min={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <span className="text-xs sm:text-sm text-gray-500">
                        {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="h-20 sm:h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default SpaceAvailability;