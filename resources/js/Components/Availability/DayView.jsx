import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * Componente DayView - Muestra la disponibilidad diaria de espacios
 * Soporta dos tipos de vistas:
 * 1. Vista de escritorios (coworking) con dropdowns
 * 2. Vista de slots horarios para otros espacios
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.escritorios - Lista de escritorios para espacios coworking
 * @param {Array} props.slots - Lista de slots horarios para espacios no coworking
 * @param {Date} props.selectedDate - Fecha seleccionada para mostrar disponibilidad
 * @param {string} props.tipoEspacio - Tipo de espacio ('coworking' o 'common')
 * @returns {JSX.Element} Componente renderizado
 */
const DayView = ({ escritorios = [], slots = [], selectedDate, tipoEspacio = 'common' }) => {
    // Formatear la fecha seleccionada para mostrarla en español
    const formattedDate = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
    
    // Determinar qué vista mostrar según el tipo de espacio
    const isCoworkingSpace = tipoEspacio === 'coworking';
    
    // Verificar si hay datos disponibles
    const hasData = isCoworkingSpace 
        ? escritorios?.length > 0 
        : slots?.length > 0;

    // Vista para espacios coworking con dropdown
    if (isCoworkingSpace && escritorios?.length > 0) {
        return (
            <div className="space-y-4">
                {/* Título con la fecha */}
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {formattedDate}
                </h3>

                {/* Grid mejorado con mejor espaciado y responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 auto-rows-start">
                    {escritorios.map((escritorio) => (
                        <Disclosure key={escritorio.id} as="div" className="group h-fit">
                            {({ open }) => (
                                <div className={`
                                    p-4 border rounded-lg transition-all duration-200
                                    ${open ? 'shadow-md border-indigo-200' : 'hover:shadow-sm hover:border-gray-300'}
                                    bg-white relative
                                `}>
                                    {/* Botón del dropdown con mejor interactividad */}
                                    <Disclosure.Button className="w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md">
                                        <div className="flex justify-between items-center">
                                            {/* Título e icono del escritorio */}
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {escritorio.tipo_espacio === 'espacio' ? 
                                                        escritorio.numero : 
                                                        `Escritorio ${escritorio.numero}`}
                                                </h4>
                                                {/* Icono con animación mejorada */}
                                                <ChevronUpIcon
                                                    className={`
                                                        w-5 h-5 transition-all duration-200
                                                        ${open ? 'transform rotate-180 text-indigo-500' : 'text-gray-400 group-hover:text-indigo-400'}
                                                    `}
                                                />
                                            </div>
                                            {/* Badge de estado con animación */}
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

                                    {/* Panel desplegable con animación mejorada */}
                                    <Transition
                                        enter="transition duration-200 ease-out"
                                        enterFrom="transform scale-98 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-150 ease-out"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-98 opacity-0"
                                    >
                                        <Disclosure.Panel className="space-y-2 mt-4">
                                            {/* Lista de slots horarios con interactividad */}
                                            {escritorio.slots?.length > 0 ? (
                                                escritorio.slots.map((slot, index) => (
                                                    <div 
                                                        key={index}
                                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                                    >
                                                        {/* Horario del slot */}
                                                        <span className="text-sm text-gray-600">
                                                            {slot.hora_inicio} - {slot.hora_fin}
                                                        </span>
                                                        {/* Badge de disponibilidad con hover effect */}
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

    // Vista para espacios no coworking (slots horarios simples)
    if (!isCoworkingSpace && slots?.length > 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {formattedDate}
                </h3>
                {/* Lista de slots con diseño simplificado */}
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
                                <span className="text-sm font-medium w-32">
                                    {slot.hora_inicio} - {slot.hora_fin}
                                </span>
                                <span className={`
                                    px-2 py-1 text-xs font-medium rounded-full
                                    ${slot.disponible 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'}
                                `}>
                                    {slot.disponible ? 'Disponible' : 'Reservado'}
                                </span>
                            </div>

                            {/* Si hay información adicional sobre la reserva */}
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

    // Vista para cuando no hay datos disponibles
    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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