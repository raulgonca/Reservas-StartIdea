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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Cabecera con navegación y selección de vista */}
            <div className="border-b border-gray-200">
                {/* Navegador de fechas con estilo mejorado */}
                <div className="p-4 border-b border-gray-100">
                    <DateNavigator 
                        currentDate={selectedDate.toISOString().split('T')[0]}
                        view={viewType}
                        onDateChange={handleDateChange}
                    />
                </div>
                
                {/* Selector de tipo de vista con mejor contraste */}
                <div className="flex justify-center py-3 px-4 bg-gray-50">
                    <div className="inline-flex rounded-md shadow-sm bg-gray-200 p-1" role="group" aria-label="Selección de vista">
                        {[
                            { key: 'day', label: 'Día', icon: '📅' },
                            { key: 'week', label: 'Semana', icon: '📆' },
                            { key: 'month', label: 'Mes', icon: '📋' }
                        ].map(({ key, label, icon }) => (
                            <button
                                key={key}
                                onClick={() => setViewType(key)}
                                className={`
                                    relative px-4 py-2 text-sm font-medium rounded-md
                                    focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                    transition-all duration-200 flex items-center
                                    ${viewType === key 
                                        ? 'bg-white text-indigo-700 shadow'
                                        : 'text-gray-700 hover:bg-gray-100'}
                                `}
                                aria-current={viewType === key ? 'page' : undefined}
                            >
                                <span className="mr-1.5" aria-hidden="true">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contenedor principal con padding consistente */}
            <div className="relative p-4">
                {/* Estado de carga con animación mejorada */}
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-200">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
                            <span className="mt-3 text-sm text-gray-600 font-medium">Cargando...</span>
                        </div>
                    </div>
                )}

                {/* Vista actual del calendario con sombra suave */}
                <div className={`transition-opacity duration-200 ${loading ? 'opacity-25' : 'opacity-100'}`}>
                    {renderCurrentView()}
                </div>
                
                {/* Leyenda de colores (opcional) */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm border-t border-gray-100 pt-4">
                    <div className="flex items-center">
                        <span className="w-4 h-4 inline-block bg-green-100 border border-green-200 rounded-sm mr-2"></span>
                        <span className="text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-4 h-4 inline-block bg-yellow-100 border border-yellow-200 rounded-sm mr-2"></span>
                        <span className="text-gray-600">Parcialmente ocupado</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-4 h-4 inline-block bg-red-100 border border-red-200 rounded-sm mr-2"></span>
                        <span className="text-gray-600">No disponible</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarContainer;