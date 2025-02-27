import React, { useState, useEffect } from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import DateNavigator from './DateNavigator';
import axios from 'axios';

/**
 * Componente CalendarContainer - Gestiona las diferentes vistas del calendario
 * @param {Object} props
 * @param {Object} props.escritorios - Datos iniciales de escritorios
 * @param {Object} props.weekData - Datos iniciales de disponibilidad semanal
 * @param {Object} props.monthData - Datos iniciales de disponibilidad mensual
 * @param {number} props.espacioId - ID del espacio para consultar disponibilidad
 * @param {string} props.tipoEspacio - Tipo de espacio (coworking, sala, etc.)
 * @returns {JSX.Element}
 */
const CalendarContainer = ({ 
    escritorios: initialEscritorios, 
    weekData: initialWeekData, 
    monthData: initialMonthData,
    espacioId,
    tipoEspacio
}) => {
    // Estado para la fecha seleccionada y el tipo de vista
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewType, setViewType] = useState('day'); // 'day', 'week', 'month'
    
    // Estados para los datos de disponibilidad
    const [escritorios, setEscritorios] = useState(initialEscritorios);
    const [weekData, setWeekData] = useState(initialWeekData);
    const [monthData, setMonthData] = useState(initialMonthData);
    const [loading, setLoading] = useState(false);

    // Manejador para cambio de día
    const handleDayClick = (date) => {
        setSelectedDate(date);
        setViewType('day');
    };

    // Función para cargar datos de disponibilidad según la fecha y tipo de vista
    const loadAvailabilityData = async (date, view) => {
        if (!espacioId) return;
        
        setLoading(true);
        const formattedDate = formatDateForAPI(date);
        
        try {
            const response = await axios.get(route('api.espacios.availability', espacioId), {
                params: {
                    fecha: formattedDate,
                    vista: view,
                    tipo_espacio: tipoEspacio
                }
            });
            
            // Actualizar estados según el tipo de vista
            if (view === 'day') {
                setEscritorios(response.data.escritorios || []);
            } else if (view === 'week') {
                setWeekData(response.data.data || {});
            } else if (view === 'month') {
                setMonthData(response.data.data || {});
            }
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear la fecha para la API
    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Efecto para cargar datos cuando cambia la fecha o vista
    useEffect(() => {
        loadAvailabilityData(selectedDate, viewType);
    }, [selectedDate, viewType, espacioId]);

    // Manejador para cambio de fecha desde DateNavigator
    const handleDateChange = (dateString) => {
        setSelectedDate(new Date(dateString));
    };

    // Selector de vista actual
    const renderCurrentView = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            );
        }

        switch (viewType) {
            case 'week':
                return (
                    <WeekView 
                        selectedDate={selectedDate}
                        onDayClick={handleDayClick}
                        weekData={weekData}
                    />
                );
            case 'month':
                return (
                    <MonthView 
                        selectedDate={selectedDate}
                        onDayClick={handleDayClick}
                        monthData={monthData}
                    />
                );
            default:
                return (
                    <DayView 
                        selectedDate={selectedDate}
                        escritorios={escritorios}
                    />
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Navegador de fechas */}
            <DateNavigator 
                currentDate={selectedDate.toISOString().split('T')[0]}
                view={viewType}
                onDateChange={handleDateChange}
            />
            
            {/* Selector de tipo de vista */}
            <div className="flex justify-center space-x-4">
                {['day', 'week', 'month'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setViewType(type)}
                        className={`
                            px-4 py-2 rounded-lg transition-all duration-200
                            ${viewType === type 
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'}
                        `}
                    >
                        {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : 'Mes'}
                    </button>
                ))}
            </div>

            {/* Estado de cargando */}
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {/* Vista actual del calendario */}
            {renderCurrentView()}
        </div>
    );
};

export default CalendarContainer;