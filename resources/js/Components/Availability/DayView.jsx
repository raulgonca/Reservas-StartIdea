import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import Legend from './Legend';

/**
 * Componente DayView - Muestra la disponibilidad diaria de espacios
 * 
 * Este componente renderiza la vista de disponibilidad para un día específico.
 * Soporta dos tipos diferentes de visualización según el tipo de espacio:
 * 1. Para espacios coworking: Muestra escritorios con desplegables para ver horarios
 * 2. Para espacios comunes: Muestra una lista simple de slots horarios disponibles
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.escritorios - Lista de escritorios con su disponibilidad (para espacios coworking)
 * @param {Array} props.slots - Lista de slots horarios disponibles (para espacios no-coworking)
 * @param {Date} props.selectedDate - Fecha seleccionada para mostrar la disponibilidad
 * @param {string} props.tipoEspacio - Tipo de espacio ('coworking' o 'common')
 * @returns {JSX.Element} Componente de vista diaria renderizado
 */
const DayView = ({ escritorios = [], slots = [], selectedDate, tipoEspacio = 'common' }) => {
    // Formatear la fecha seleccionada para mostrarla en español
    const formattedDate = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
    
    // Determinar qué vista mostrar según el tipo de espacio
    const isCoworkingSpace = tipoEspacio === 'coworking';
    
    // Verificar si hay datos disponibles según el tipo de espacio
    const hasData = isCoworkingSpace 
        ? escritorios?.length > 0 
        : slots?.length > 0;

    /**
     * Vista para espacios coworking - Muestra escritorios con desplegables
     * Cada escritorio puede expandirse para mostrar sus slots horarios disponibles
     */
    if (isCoworkingSpace && escritorios?.length > 0) {
        return (
            <div className="space-y-4">
                {/* Título con fecha y leyenda en layout responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h3 className="text-lg font-medium text-gray-900 capitalize py-2 px-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        {formattedDate}
                    </h3>
                    
                    {/* Leyenda integrada para explicación de colores */}
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm sm:w-auto w-full">
                        <Legend />
                    </div>
                </div>

                {/* Lista de escritorios con desplegables */}
                <div className="grid grid-cols-1 gap-6 auto-rows-start">
                    {escritorios.map((escritorio) => (
                        <Disclosure key={escritorio.id} as="div" className="group h-fit">
                            {({ open }) => (
                                <div className={`
                                    p-4 border rounded-lg transition-all duration-200
                                    ${open ? 'shadow-md border-indigo-200' : 'hover:shadow-sm hover:border-gray-300'}
                                    bg-white relative
                                `}>
                                    {/* Encabezado del escritorio (botón desplegable) */}
                                    <Disclosure.Button 
                                        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
                                        aria-label={`Ver horarios disponibles para ${escritorio.tipo_espacio === 'espacio' ? escritorio.numero : `Escritorio ${escritorio.numero}`}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            {/* Título e icono del escritorio */}
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {escritorio.tipo_espacio === 'espacio' ? 
                                                        escritorio.numero : 
                                                        `Escritorio ${escritorio.numero}`}
                                                </h4>
                                                {/* Icono indicador con animación de rotación */}
                                                <ChevronUpIcon
                                                    className={`
                                                        w-5 h-5 transition-all duration-200
                                                        ${open ? 'transform rotate-180 text-indigo-500' : 'text-gray-400 group-hover:text-indigo-400'}
                                                    `}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            {/* Badge de estado con animación de hover */}
                                            <span className={`
                                                px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200
                                                ${escritorio.status === 'free' 
                                                    ? 'bg-green-100 text-green-800 group-hover:bg-green-200'
                                                    : escritorio.status === 'partial'
                                                    ? 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200'
                                                    : 'bg-red-100 text-red-800 group-hover:bg-red-200'}
                                            `}>
                                                {escritorio.status === 'free' 
                                                    ? 'Disponible' 
                                                    : escritorio.status === 'partial'
                                                    ? 'Parcialmente ocupado'
                                                    : 'Ocupado'}
                                            </span>
                                        </div>
                                    </Disclosure.Button>

                                    {/* Panel desplegable con slots horarios */}
                                    <Transition
                                        enter="transition duration-200 ease-out"
                                        enterFrom="transform scale-98 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-150 ease-out"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-98 opacity-0"
                                    >
                                        <Disclosure.Panel className="space-y-2 mt-4">
                                            {/* Lista de slots horarios */}
                                            {escritorio.slots?.length > 0 ? (
                                                escritorio.slots.map((slot, index) => (
                                                    <div 
                                                        key={index}
                                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                                    >
                                                        {/* Rango horario */}
                                                        <span className="text-sm text-gray-600">
                                                            {slot.hora_inicio} - {slot.hora_fin}
                                                        </span>
                                                        {/* Indicador de disponibilidad */}
                                                        <span className={`
                                                            px-2 py-1 text-xs font-medium rounded-full transition-colors
                                                            ${slot.disponible 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'}
                                                        `}>
                                                            {slot.disponible ? 'Libre' : 'Reservado'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-500 p-3">
                                                    No hay horarios disponibles para este escritorio
                                                </div>
                                            )}
                                        </Disclosure.Panel>
                                    </Transition>
                                </div>
                            )}
                        </Disclosure>
                    ))}
                </div>
            </div>
        );
    }

    /**
     * Vista para espacios no-coworking - Muestra lista simple de slots horarios
     * Ideal para salas de reuniones, espacios comunes y otros tipos de espacios
     */
    if (!isCoworkingSpace && slots?.length > 0) {
        return (
            <div className="space-y-4">
                {/* Título con fecha y leyenda */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h3 className="text-lg font-medium text-gray-900 capitalize py-2 px-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        {formattedDate}
                    </h3>
                    
                    {/* Leyenda de colores */}
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm sm:w-auto w-full">
                        <Legend />
                    </div>
                </div>
                
                {/* Lista de slots horarios simplificada */}
                <div className="max-w-3xl mx-auto space-y-2">
                    {slots.map((slot, index) => (
                        <div 
                            key={index}
                            className={`
                                flex justify-between items-center p-3 border rounded-lg 
                                hover:shadow-sm transition-shadow
                                ${slot.disponible ? 'hover:border-green-200' : 'hover:border-red-200'}
                            `}
                        >
                            <div className="flex items-center space-x-4">
                                {/* Horario del slot */}
                                <span className="text-sm font-medium w-32">
                                    {slot.hora_inicio} - {slot.hora_fin}
                                </span>
                                {/* Indicador de disponibilidad */}
                                <span className={`
                                    px-2 py-1 text-xs font-medium rounded-full
                                    ${slot.disponible 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'}
                                `}>
                                    {slot.disponible ? 'Disponible' : 'Reservado'}
                                </span>
                            </div>

                            {/* Información adicional de la reserva si está ocupado */}
                            {!slot.disponible && slot.reserva && (
                                <div className="text-xs text-gray-500">
                                    Reservado por: {slot.reserva.usuario || 'Usuario'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /**
     * Vista para cuando no hay datos disponibles
     * Muestra un estado vacío con mensaje informativo al usuario
     */
    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {/* Icono de calendario */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {/* Mensaje de estado vacío */}
            <div className="text-center">
                <p className="text-gray-500 font-medium">
                    No hay información de disponibilidad para {formattedDate.toLowerCase()}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                    {isCoworkingSpace 
                        ? 'No se encontraron escritorios disponibles' 
                        : 'No se encontraron horarios disponibles'}
                </p>
            </div>
        </div>
    );
};

export default DayView;