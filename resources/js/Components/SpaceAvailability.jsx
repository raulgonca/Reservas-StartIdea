import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfWeek, addDays, startOfMonth, getWeeksInMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Funciones de utilidad para manejar estados de disponibilidad
const getStatusColor = (status) => {
    switch (status) {
        case 'free':
            return 'bg-green-500';
        case 'partial':
            return 'bg-yellow-500';
        case 'occupied':
            return 'bg-red-500';
        case 'unknown':
            return 'bg-gray-300';
        default:
            return 'bg-gray-300';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'free':
            return 'Disponible';
        case 'partial':
            return 'Parcialmente ocupado';
        case 'occupied':
            return 'Ocupado';
        case 'unknown':
            return 'No disponible temporalmente';
        default:
            return 'No disponible temporalmente';
    }
};

// Componente para mostrar un elemento de la leyenda
const LegendItem = ({ color, text }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${color}`}></div>
        <span className="text-sm text-gray-600">{text}</span>
    </div>
);

// Componente para mostrar la leyenda de disponibilidad
// Actualizar el componente AvailabilityLegend
const AvailabilityLegend = () => (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <LegendItem color="bg-green-500" text="Disponible" />
        <LegendItem color="bg-yellow-500" text="Parcialmente ocupado" />
        <LegendItem color="bg-red-500" text="Ocupado" />
        <LegendItem color="bg-gray-300" text="No disponible temporalmente" />
    </div>
);

/**
 * Componente principal para mostrar la disponibilidad de espacios
 * @param {Object} props
 * @param {Object} props.space - Datos del espacio
 */
const SpaceAvailability = ({ space }) => {
    // Estados del componente
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day');
    const [availability, setAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Efecto para cargar la disponibilidad
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

    // Selector de modo de visualización
    const renderViewSelector = () => (
        <div className="flex gap-2 mb-4">
            <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded ${
                    viewMode === 'day' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
                Día
            </button>
            <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded ${
                    viewMode === 'week' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
                Semana
            </button>
            <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded ${
                    viewMode === 'month' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
                Mes
            </button>
        </div>
    );

    // Vista semanal
    const renderWeekView = () => {
        const weekStart = startOfWeek(selectedDate, { locale: es });
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

        return (
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                    const dayData = availability?.weekAvailability?.[format(day, 'yyyy-MM-dd')];
                    const status = dayData?.status || 'unknown';
                    const reservas = dayData?.reservas || [];

                    return (
                        <div 
                            key={day.toString()}
                            className={`p-2 border rounded hover:shadow transition-shadow ${
                                isSameDay(day, selectedDate) 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200'
                            }`}
                            onClick={() => {
                                setSelectedDate(day);
                                setViewMode('day');
                            }}
                        >
                            <div className="text-sm font-medium mb-1">
                                {format(day, 'EEE', { locale: es })}
                            </div>
                            <div className="text-xs mb-2">
                                {format(day, 'd', { locale: es })}
                            </div>
                            <div className={`h-2 rounded-full ${getStatusColor(status)}`}
                                 title={getStatusText(status)} />
                            {reservas.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500 text-center">
                                    {reservas.length} reserva(s)
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Vista mensual
    const renderMonthView = () => {
        const monthStart = startOfMonth(selectedDate);
        const weeksInMonth = getWeeksInMonth(selectedDate);
        const weeks = Array.from({ length: weeksInMonth }, (_, weekIndex) => {
            return Array.from({ length: 7 }, (_, dayIndex) => {
                const day = addDays(startOfWeek(monthStart), weekIndex * 7 + dayIndex);
                return day;
            });
        });

        return (
            <div className="space-y-2">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                        {week.map((day) => {
                            const dayData = availability?.monthAvailability?.[format(day, 'yyyy-MM-dd')];
                            const status = dayData?.status || 'unknown';
                            const reservas = dayData?.reservas || [];

                            return (
                                <div 
                                    key={day.toString()}
                                    className={`p-2 border rounded cursor-pointer hover:shadow transition-shadow ${
                                        isSameDay(day, selectedDate) 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200'
                                    }`}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        setViewMode('day');
                                    }}
                                >
                                    <div className="text-xs font-medium mb-1">
                                        {format(day, 'd', { locale: es })}
                                    </div>
                                    <div className={`h-1.5 rounded-full ${getStatusColor(status)}`}
                                         title={getStatusText(status)} />
                                    {reservas.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500 text-center">
                                            {reservas.length}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    // Vista diaria
    const renderDayView = () => {
        if (space.tipo === 'coworking' && availability?.escritorios) {
            return (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availability.escritorios.map((desk) => (
                        <div
                            key={desk.id}
                            className={`p-4 rounded-lg shadow ${
                                desk.disponible 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                            }`}
                        >
                            <div className="text-center">
                                <span className="text-lg font-medium">
                                    Escritorio {desk.numero}
                                </span>
                                <span className={`block text-sm ${
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
            );
        }

        // Horarios fijos de 08:00 a 20:00
        const hours = Array.from({ length: 13 }, (_, i) => 
            format(new Date().setHours(8 + i, 0), 'HH:mm')
        );

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {hours.map((hour) => {
                    const slot = availability?.slots?.find(s => s.time === hour) || 
                               { time: hour, isAvailable: true };
                    return (
                        <div
                            key={hour}
                            className={`p-3 rounded-md text-center ${
                                slot.isAvailable 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                            }`}
                        >
                            <span className="text-sm font-medium">
                                {hour}
                            </span>
                            <span className={`block text-xs ${
                                slot.isAvailable 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                {slot.isAvailable ? 'Disponible' : 'Ocupado'}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Estado de carga
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

    // Render principal
    return (
        <div className="mt-4">
            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">
                    Disponibilidad
                </h4>
                {renderViewSelector()}
                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                        min={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <span className="text-sm text-gray-500">
                        {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                </div>
                {viewMode !== 'day' && <AvailabilityLegend />}
            </div>

            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'day' && renderDayView()}
        </div>
    );
};

export default SpaceAvailability;