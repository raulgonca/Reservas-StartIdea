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
 * @returns {JSX.Element} Componente renderizado
 */
const DayView = ({ escritorios, slots, selectedDate }) => {
    // Formatear la fecha seleccionada para mostrarla en español
    const formattedDate = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });

    // Vista para espacios coworking con dropdown
    if (escritorios?.length > 0) {
        return (
            <div className="space-y-4">
                {/* Título con la fecha */}
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {formattedDate}
                </h3>

                {/* Grid mejorado con mejor espaciado y responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-start">
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
                                                    Escritorio {escritorio.numero}
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
                                            {escritorio.slots?.map((slot, index) => (
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
                                            ))}
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
    if (slots?.length > 0) {
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
                            className="flex justify-between items-center p-3 border rounded-lg hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium w-32">
                                    {slot.hora_inicio} - {slot.hora_fin}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    slot.disponible 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {slot.disponible ? 'Disponible' : 'Reservado'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Vista para cuando no hay datos disponibles
    return (
        <div className="text-center py-8">
            <p className="text-gray-500">
                No hay información de disponibilidad para {formattedDate.toLowerCase()}
            </p>
        </div>
    );
};

export default DayView;