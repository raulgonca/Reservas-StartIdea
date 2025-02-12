import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ConfirmDelete({ reserva, onConfirm, onCancel }) {
    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatTime = (dateString) => {
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleTimeString('es-ES', options);
    };

    const getTipoReservaText = (tipo) => {
        const tipos = {
            'hora': 'Por Hora',
            'medio_dia': 'Medio Día',
            'dia_completo': 'Día Completo',
            'semana': 'Semana',
            'mes': 'Mes'
        };
        return tipos[tipo] || tipo;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmada':
                return 'text-green-600 bg-green-100';
            case 'pendiente':
                return 'text-yellow-600 bg-yellow-100';
            case 'cancelada':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <Modal show={true} onClose={onCancel}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">
                    Confirmar Eliminación
                </h2>
                <p className="text-center mb-4 text-gray-600">
                    ¿Estás seguro de que deseas eliminar la siguiente reserva?
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                    <p><strong>ID:</strong> {reserva.id}</p>
                    <p><strong>Usuario:</strong> {reserva.user.name}</p>
                    <p><strong>Email:</strong> {reserva.user.email}</p>
                    <p><strong>Espacio:</strong> {reserva.espacio.nombre}</p>
                    <p><strong>Escritorio:</strong> {
                        reserva.espacio.tipo === 'coworking' 
                            ? (reserva.escritorio?.nombre || 'Sin asignar') 
                            : 'N/A'
                    }</p>
                    <p><strong>Fecha Inicio:</strong> {formatDate(reserva.fecha_inicio)}</p>
                    <p><strong>Hora Inicio:</strong> {formatTime(reserva.fecha_inicio)}</p>
                    <p><strong>Fecha Fin:</strong> {formatDate(reserva.fecha_fin)}</p>
                    <p><strong>Hora Fin:</strong> {formatTime(reserva.fecha_fin)}</p>
                    <p><strong>Tipo de Reserva:</strong> {getTipoReservaText(reserva.tipo_reserva)}</p>
                    <p>
                        <strong>Estado:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getStatusClass(reserva.estado)}`}>
                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                    </p>
                    {reserva.motivo && (
                        <p><strong>Motivo:</strong> {reserva.motivo}</p>
                    )}
                </div>

                <div className="bg-red-50 p-4 rounded-lg mb-4 text-sm text-red-600">
                    <p className="font-semibold">¡Advertencia!</p>
                    <p>Esta acción eliminará permanentemente la reserva y no se puede deshacer.</p>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <PrimaryButton onClick={onCancel}>
                        Cancelar
                    </PrimaryButton>
                    <DangerButton onClick={onConfirm}>
                        Confirmar Eliminación
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}