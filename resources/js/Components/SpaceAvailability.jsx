import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import CalendarContainer from './Availability/CalendarContainer';

/**
 * Componente principal para mostrar la disponibilidad de espacios
 * @component
 * @param {Object} props
 * @param {Object} props.space - Información del espacio (id, tipo, etc)
 */
const SpaceAvailability = ({ space }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        escritorios: [],
        weekData: {},
        monthData: {}
    });

    useEffect(() => {
        const fetchAllAvailability = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Crear fecha actual formateada
                const today = new Date();
                const formattedDate = format(today, 'yyyy-MM-dd');
                
                // Realizar las 3 peticiones en paralelo para mejorar rendimiento
                const [dayResponse, weekResponse, monthResponse] = await Promise.all([
                    // Petición para vista diaria
                    axios.get(`/v1/espacios/${space.id}/availability`, {
                        params: { fecha: formattedDate, vista: 'day' }
                    }),
                    
                    // Petición para vista semanal
                    axios.get(`/v1/espacios/${space.id}/availability`, {
                        params: { fecha: formattedDate, vista: 'week' }
                    }),
                    
                    // Petición para vista mensual
                    axios.get(`/v1/espacios/${space.id}/availability`, {
                        params: { fecha: formattedDate, vista: 'month' }
                    })
                ]);
                
                // Combinar los datos de las tres respuestas
                setData({
                    // Los escritorios vienen en la respuesta diaria
                    escritorios: dayResponse.data.escritorios || [],
                    // Los datos semanales y mensuales vienen en sus respectivas respuestas
                    weekData: weekResponse.data.weekData || {},
                    monthData: monthResponse.data.monthData || {}
                });
                
                console.log('Datos cargados correctamente:', {
                    day: dayResponse.data,
                    week: weekResponse.data,
                    month: monthResponse.data
                });
                
            } catch (error) {
                console.error('Error al cargar disponibilidad:', error);
                setError('Error al cargar la disponibilidad. Por favor, intente de nuevo.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllAvailability();
    }, [space.id]);

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                Disponibilidad
            </h2>
            
            <div className="bg-white rounded-lg shadow p-4">
                <CalendarContainer 
                    escritorios={data.escritorios}
                    weekData={data.weekData}
                    monthData={data.monthData}
                />
            </div>
        </div>
    );
};

export default SpaceAvailability;