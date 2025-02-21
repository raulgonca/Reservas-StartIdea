import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ViewSelector from './Availability/ViewSelector';
import DateSelector from './Availability/DateSelector';
import Legend from './Availability/Legend';
import WeekView from './Availability/WeekView';
import MonthView from './Availability/MonthView';
import DeskView from './Availability/DeskView';

/**
 * Componente para gestionar la disponibilidad de escritorios
 * @param {Object} props
 * @param {Object} props.space - Datos del espacio de coworking
 */
const DeskAvailability = ({ space }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day');
    const [availability, setAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/v1/espacios/${space.id}/availability`, {
                    params: {
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        viewMode
                    }
                });
                setAvailability(response.data);
            } catch (error) {
                console.error('Error al cargar disponibilidad:', error);
            }
            setIsLoading(false);
        };

        fetchAvailability();
    }, [space.id, selectedDate, viewMode]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setViewMode('day');
    };

    if (isLoading) {
        return (
            <div className="mt-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">
                    Escritorios Disponibles
                </h4>
                <ViewSelector 
                    viewMode={viewMode} 
                    onViewChange={setViewMode} 
                />
                <DateSelector 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
                {viewMode !== 'day' && <Legend />}
            </div>

            {viewMode === 'week' && (
                <WeekView 
                    selectedDate={selectedDate}
                    availability={availability}
                    onDateSelect={handleDateSelect}
                />
            )}
            {viewMode === 'month' && (
                <MonthView 
                    selectedDate={selectedDate}
                    availability={availability}
                    onDateSelect={handleDateSelect}
                />
            )}
            {viewMode === 'day' && (
                <DeskView escritorios={availability?.escritorios} />
            )}
        </div>
    );
};

export default DeskAvailability;