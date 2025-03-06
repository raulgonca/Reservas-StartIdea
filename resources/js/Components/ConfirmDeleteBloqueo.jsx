import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ConfirmDeleteBloqueo({ bloqueo, onConfirm, onCancel }) {
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

    // Determinar el estado visual del bloqueo
    const getBloqueoStatus = () => {
        const now = new Date();
        const inicio = new Date(bloqueo.fecha_inicio);
        const fin = new Date(bloqueo.fecha_fin);
        
        if (now < inicio) {
            return { label: "Pendiente", class: "text-yellow-600 bg-yellow-100" };
        } else if (now > fin) {
            return { label: "Finalizado", class: "text-gray-600 bg-gray-100" };
        } else {
            return { label: "Activo", class: "text-green-600 bg-green-100" };
        }
    };

    const status = getBloqueoStatus();

    return (
        <Modal show={true} onClose={onCancel}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">
                    Confirmar Eliminación
                </h2>
                <p className="text-center mb-4 text-gray-600">
                    ¿Estás seguro de que deseas eliminar el siguiente bloqueo?
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                    <p><strong>ID:</strong> {bloqueo.id}</p>
                    <p><strong>Espacio:</strong> {bloqueo.espacio?.nombre || 'N/A'}</p>
                    <p><strong>Escritorio:</strong> {bloqueo.escritorio?.nombre || bloqueo.escritorio?.numero || 'Todo el espacio'}</p>
                    <p><strong>Fecha Inicio:</strong> {formatDate(bloqueo.fecha_inicio)}</p>
                    <p><strong>Hora Inicio:</strong> {formatTime(bloqueo.fecha_inicio)}</p>
                    <p><strong>Fecha Fin:</strong> {formatDate(bloqueo.fecha_fin)}</p>
                    <p><strong>Hora Fin:</strong> {formatTime(bloqueo.fecha_fin)}</p>
                    <p>
                        <strong>Estado:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${status.class}`}>
                            {status.label}
                        </span>
                    </p>
                    <p><strong>Motivo:</strong> {bloqueo.motivo || 'No especificado'}</p>
                    {bloqueo.creadoPor && (
                        <p><strong>Creado por:</strong> {bloqueo.creadoPor.name}</p>
                    )}
                </div>

                <div className="bg-red-50 p-4 rounded-lg mb-4 text-sm text-red-600">
                    <p className="font-semibold">¡Advertencia!</p>
                    <p>Esta acción eliminará permanentemente el bloqueo y no se puede deshacer.</p>
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