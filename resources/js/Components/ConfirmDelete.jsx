import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ConfirmDelete({ reserva, onConfirm, onCancel }) {
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('es-ES', options);
    };

    return (
        <Modal show={true} onClose={onCancel}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">¿Estás seguro de que deseas eliminar la siguiente reserva?</p>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p><strong>ID:</strong> {reserva.id}</p>
                    <p><strong>Usuario:</strong> {reserva.user.name}</p>
                    <p><strong>Espacio:</strong> {reserva.espacio.nombre}</p>
                    <p><strong>Escritorio:</strong> {reserva.espacio.tipo === 'coworking' ? reserva.escritorio.nombre : 'N/A'}</p>
                    <p><strong>Fecha Inicio:</strong> {formatDate(reserva.fecha_inicio)}</p>
                    <p><strong>Hora Inicio:</strong> {formatTime(reserva.fecha_inicio)}</p>
                    <p><strong>Fecha Fin:</strong> {formatDate(reserva.fecha_fin)}</p>
                    <p><strong>Hora Fin:</strong> {formatTime(reserva.fecha_fin)}</p>
                    <p><strong>Tipo de Reserva:</strong> {reserva.tipo_reserva}</p>
                    <p><strong>Estado:</strong> {reserva.estado}</p>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                    <PrimaryButton onClick={onCancel} className="mr-2">Cancelar</PrimaryButton>
                    <DangerButton onClick={onConfirm}>Eliminar</DangerButton>
                </div>
            </div>
        </Modal>
    );
}