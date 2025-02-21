import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ViewSelector from './Availability/ViewSelector';
import DateSelector from './Availability/DateSelector';
import Legend from './Availability/Legend';
import DayView from './Availability/DayView';
import WeekView from './Availability/WeekView';
import MonthView from './Availability/MonthView';
import { VIEW_MODES } from './Availability/constants';

/**
 * Componente principal para mostrar la disponibilidad de espacios
 * @component
 * @param {Object} props
 * @param {Object} props.space - Información del espacio (id, tipo, etc)
 */
const SpaceAvailability = ({ space }) => {
    // Estados del componente
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState(VIEW_MODES.DAY);
    const [availability, setAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDesk, setSelectedDesk] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Efecto para cargar los datos de disponibilidad
     */
    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const url = `/v1/espacios/${space.id}/availability`;
                const response = await axios.get(url, {
                    params: {
                        fecha: format(selectedDate, 'yyyy-MM-dd'),
                        vista: viewMode.toLowerCase(),
                        escritorio: selectedDesk,
                        tipo_espacio: space.tipo
                    }
                });

                console.log('Respuesta:', response.data);
                setAvailability(response.data);
            } catch (error) {
                console.error('Error al cargar disponibilidad:', error);
                setError('Error al cargar la disponibilidad. Por favor, intente de nuevo.');
                setAvailability(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailability();
    }, [space.id, selectedDate, viewMode, selectedDesk]);

    /**
     * Manejador para cambio de fecha
     */
    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (viewMode === VIEW_MODES.DAY) {
            setSelectedDesk(null); // Reset desk selection in day view
        }
    };

    /**
     * Manejador para cambio de vista
     */
    const handleViewChange = (newView) => {
        setViewMode(newView);
        if (newView === VIEW_MODES.DAY) {
            setSelectedDesk(null);
        }
    };

    // Renderizado del estado de carga
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Renderizado del estado de error
    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <h2 className="text-2xl font-semibold text-gray-800">
                Disponibilidad
            </h2>
            
            {/* Controles superiores */}
            <div className="space-y-4">
                {/* Selector de vista */}
                <ViewSelector 
                    viewMode={viewMode}
                    onViewChange={handleViewChange}
                />
                
                {/* Selector de fecha */}
                <DateSelector
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    viewMode={viewMode}
                />

                {/* Leyenda y selector de escritorio */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <Legend />
                    {space.tipo === 'coworking' && viewMode !== VIEW_MODES.DAY && (
                        <select
                            value={selectedDesk || ''}
                            onChange={(e) => setSelectedDesk(e.target.value)}
                            className="form-select rounded-md border-gray-300 w-full sm:w-auto"
                        >
                            <option value="">Todos los escritorios</option>
                            {availability?.escritorios?.map(desk => (
                                <option key={desk.id} value={desk.id}>
                                    Escritorio {desk.numero}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Vistas de disponibilidad */}
            <div className="bg-white rounded-lg shadow p-4">
                {viewMode === VIEW_MODES.DAY && (
                    <DayView 
                        escritorios={availability?.escritorios}
                        slots={availability?.slots}
                        selectedDate={selectedDate}
                    />
                )}
                
                {viewMode === VIEW_MODES.WEEK && (
                    <WeekView 
                        selectedDate={selectedDate}
                        availability={availability}
                        onDateSelect={handleDateChange}
                        selectedDesk={selectedDesk}
                    />
                )}
                
                {viewMode === VIEW_MODES.MONTH && (
                    <MonthView 
                        selectedDate={selectedDate}
                        availability={availability}
                        onDateSelect={handleDateChange}
                        selectedDesk={selectedDesk}
                    />
                )}
            </div>
        </div>
    );
};

export default SpaceAvailability;