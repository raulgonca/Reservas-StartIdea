import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusColor, getStatusText } from './utils';

/**
 * Componente para mostrar la disponibilidad diaria
 * @param {Object} props
 * @param {Array} props.escritorios - Lista de escritorios para espacios coworking
 * @param {Array} props.slots - Lista de slots horarios para espacios no coworking
 * @param {Date} props.selectedDate - Fecha seleccionada
 */
const DayView = ({ escritorios, slots, selectedDate }) => {
    // Formatear la fecha seleccionada
    const formattedDate = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });

    // Vista para espacios coworking
    if (escritorios?.length > 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {formattedDate}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {escritorios.map((escritorio) => (
                        <div
                            key={escritorio.id}
                            className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-lg font-medium text-gray-900">
                                    Escritorio {escritorio.numero}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    escritorio.status === 'free' 
                                        ? 'bg-green-100 text-green-800'
                                        : escritorio.status === 'partial'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {escritorio.status === 'free' 
                                        ? 'Disponible' 
                                        : escritorio.status === 'partial'
                                        ? 'Parcialmente ocupado'
                                        : 'Ocupado'}
                                </span>
                            </div>

                            {/* Horarios del escritorio */}
                            <div className="space-y-2">
                                {escritorio.slots?.map((slot, index) => (
                                    <div 
                                        key={index}
                                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                    >
                                        <span className="text-sm text-gray-600">
                                            {slot.hora_inicio} - {slot.hora_fin}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            slot.disponible 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {slot.disponible ? 'Libre' : 'Reservado'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Vista para otros espacios (horarios)
    if (slots?.length > 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {formattedDate}
                </h3>
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

    // Si no hay datos
    return (
        <div className="text-center py-8">
            <p className="text-gray-500">
                No hay información de disponibilidad para {formattedDate.toLowerCase()}
            </p>
        </div>
    );
};

export default DayView;