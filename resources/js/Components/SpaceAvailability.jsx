import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente que muestra la disponibilidad de un espacio
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.space - Datos del espacio
 */
const SpaceAvailability = ({ space }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availability, setAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/v1/espacios/${space.id}/availability`, {
                    params: {
                        date: format(selectedDate, 'yyyy-MM-dd')
                    }
                });
                setAvailability(response.data);
            } catch (error) {
                console.error('Error al cargar disponibilidad:', error);
            }
            setIsLoading(false);
        };

        fetchAvailability();
    }, [space.id, selectedDate]);

    // Estado de carga responsive
    if (isLoading) {
        return (
            <div className="mt-4 sm:mt-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 sm:mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-20 sm:h-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Renderizar escritorios para espacios de coworking
    if (space.tipo === 'coworking' && availability?.escritorios) {
        return (
            <div className="mt-4 sm:mt-6">
                <div className="mb-4 sm:mb-6">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                        Escritorios Disponibles
                    </h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                        <input
                            type="date"
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm 
                                     focus:border-blue-300 focus:ring focus:ring-blue-200 
                                     focus:ring-opacity-50 text-sm sm:text-base"
                            min={format(new Date(), 'yyyy-MM-dd')}
                        />
                        <span className="text-xs sm:text-sm text-gray-500">
                            {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {availability.escritorios.map((desk) => (
                        <div
                            key={desk.id}
                            className={`p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow ${
                                desk.disponible 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-base sm:text-lg font-medium mb-1">
                                    Escritorio {desk.numero}
                                </span>
                                <span className={`text-xs sm:text-sm font-medium ${
                                    desk.disponible 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`}>
                                    {desk.disponible ? 'Disponible' : 'Ocupado'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Renderizar slots de tiempo para otros tipos de espacios
    return (
        <div className="mt-4 sm:mt-6">
            <div className="mb-4 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Disponibilidad
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                    <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm 
                                 focus:border-blue-300 focus:ring focus:ring-blue-200 
                                 focus:ring-opacity-50 text-sm sm:text-base"
                        min={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <span className="text-xs sm:text-sm text-gray-500">
                        {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {availability?.slots?.map((slot) => (
                    <div
                        key={slot.time}
                        className={`p-2 sm:p-3 rounded-md text-center ${
                            slot.isAvailable 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}
                    >
                        <span className="text-sm sm:text-base font-medium">
                            {slot.time}
                        </span>
                        <span className={`block text-xs mt-1 ${
                            slot.isAvailable 
                                ? 'text-green-600' 
                                : 'text-red-600'
                        }`}>
                            {slot.isAvailable ? 'Disponible' : 'Ocupado'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpaceAvailability;