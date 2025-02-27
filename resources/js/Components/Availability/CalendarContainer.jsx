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
    const [loading, setLoading] = useState(true); // Comenzamos con loading=true para mostrar skeleton inmediatamente
    const [initialized, setInitialized] = useState(false);

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
            
            // Añadir un pequeño delay para asegurar que se vea el skeleton (solo para demostración)
            // En producción puedes quitar este timeout
            setTimeout(() => {
                // Actualizar estados según el tipo de vista
                if (view === 'day') {
                    setEscritorios(response.data.escritorios || []);
                } else if (view === 'week') {
                    setWeekData(response.data.data || {});
                } else if (view === 'month') {
                    setMonthData(response.data.data || {});
                }
                setLoading(false);
                setInitialized(true);
            }, 1000);
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            setLoading(false);
            setInitialized(true);
        }
    };

    // Función para formatear la fecha para la API
    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Efecto para cargar datos cuando cambia la fecha o vista
    useEffect(() => {
        // Solo cargar datos si tenemos un espacioId válido
        if (espacioId) {
            loadAvailabilityData(selectedDate, viewType);
        } else {
            // Si no tenemos espacioId, no intentar cargar y quitar el estado de loading
            setLoading(false);
            setInitialized(true);
        }
    }, [selectedDate, viewType, espacioId]);

    // Verificar si ya tenemos datos iniciales, para salir del estado de loading
    useEffect(() => {
        // Si tenemos datos iniciales y aún no nos hemos inicializado
        if (!initialized && (
            (viewType === 'day' && initialEscritorios?.length > 0) ||
            (viewType === 'week' && Object.keys(initialWeekData || {}).length > 0) ||
            (viewType === 'month' && Object.keys(initialMonthData || {}).length > 0)
        )) {
            setLoading(false);
            setInitialized(true);
        }
    }, [initialized, initialEscritorios, initialWeekData, initialMonthData, viewType]);

    // Manejador para cambio de fecha desde DateNavigator
    const handleDateChange = (dateString) => {
        setSelectedDate(new Date(dateString));
    };

    // Componentes de skeleton para cada tipo de vista
    const DayViewSkeleton = () => (
        <div className="animate-pulse">
            {/* Simulación de un escritorio/espacio */}
            <div className="mb-6">
                <div className="h-7 bg-gray-200 w-48 rounded-md mb-3"></div>
                <div className="border rounded-lg overflow-hidden">
                    {/* Encabezados de horas */}
                    <div className="flex border-b">
                        <div className="w-1/4 h-10 bg-gray-100 border-r"></div>
                        <div className="w-3/4 flex">
                            <div className="flex-1 h-10 bg-gray-50 px-2 flex items-center justify-center border-r">
                                <div className="h-4 bg-gray-200 w-16 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Filas de horas (12 slots) */}
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="flex border-b last:border-b-0">
                            {/* Hora */}
                            <div className="w-1/4 h-12 px-3 py-2 border-r flex items-center">
                                <div className="h-4 bg-gray-200 w-14 rounded-md"></div>
                            </div>
                            {/* Estado del slot */}
                            <div className="w-3/4 h-12 px-3 py-2 flex items-center">
                                <div className={`h-6 rounded-md w-full ${
                                    i % 3 === 0 ? 'bg-green-100' : 
                                    i % 3 === 1 ? 'bg-yellow-100' : 
                                    'bg-red-100'
                                }`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const WeekViewSkeleton = () => (
        <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Cabecera de días de la semana */}
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="text-center">
                        <div className="h-5 bg-gray-200 w-8 mx-auto rounded-md mb-1"></div>
                        <div className="h-8 bg-gray-200 w-8 mx-auto rounded-full"></div>
                    </div>
                ))}
            </div>
            
            {/* Contenido de la semana */}
            <div className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-24 rounded-md border p-2 ${
                            i % 3 === 0 ? 'bg-green-50' : 
                            i % 3 === 1 ? 'bg-yellow-50' : 
                            'bg-red-50'
                        }`}
                    >
                        <div className="h-4 bg-gray-200 w-2/3 rounded-md mb-2"></div>
                        <div className="h-3 bg-gray-200 w-1/2 rounded-md mb-2"></div>
                        <div className="h-3 bg-gray-200 w-3/4 rounded-md"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const MonthViewSkeleton = () => (
        <div className="animate-pulse">
            {/* Cabecera con nombres de días */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                    <div key={i} className="text-center">
                        <div className="h-5 bg-gray-200 w-8 mx-auto rounded-md"></div>
                    </div>
                ))}
            </div>
            
            {/* Cuadrícula del mes (5 semanas) */}
            {[...Array(5)].map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                    {[...Array(7)].map((_, dayIndex) => {
                        // Crear algunos días no disponibles para que se vea más realista
                        const isCurrentMonth = weekIndex !== 0 || dayIndex > 2;
                        const statusClass = isCurrentMonth 
                            ? ((weekIndex + dayIndex) % 4 === 0) 
                                ? 'bg-red-50' 
                                : ((weekIndex + dayIndex) % 4 === 1) 
                                    ? 'bg-yellow-50' 
                                    : 'bg-green-50'
                            : 'bg-gray-50';
                            
                        return (
                            <div 
                                key={dayIndex} 
                                className={`h-16 rounded-md border p-1 ${statusClass}`}
                            >
                                {/* Número de día */}
                                <div className="h-6 w-6 rounded-full mx-auto mb-1 flex items-center justify-center">
                                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                                </div>
                                {isCurrentMonth && (
                                    <div className="h-2 bg-gray-200 w-1/2 rounded-md mx-auto"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    // Selector de vista actual con skeletons realistas
    const renderCurrentView = () => {
        if (loading) {
            switch (viewType) {
                case 'week':
                    return <WeekViewSkeleton />;
                case 'month':
                    return <MonthViewSkeleton />;
                default:
                    return <DayViewSkeleton />;
            }
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
                {/* Vista actual del calendario (ahora con skeletons realistas) */}
                <div className="transition-all duration-300">
                    {renderCurrentView()}
                </div>
                
                {/* Leyenda de colores */}
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