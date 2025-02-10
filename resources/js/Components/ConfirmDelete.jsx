import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ConfirmDelete({ reserva, onConfirm, onCancel }) {
    return (
        <Modal show={true} onClose={onCancel}>
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar la reserva?</p>
            <p><strong>ID:</strong> {reserva.id}</p>
            <p><strong>Usuario:</strong> {reserva.user.name}</p>
            <p><strong>Espacio:</strong> {reserva.espacio.nombre}</p>
            <div className="flex justify-end mt-4">
                <PrimaryButton onClick={onCancel} className="mr-2">Cancelar</PrimaryButton>
                <DangerButton onClick={onConfirm}>Eliminar</DangerButton>
            </div>
        </Modal>
    );
}