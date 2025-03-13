import React from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function ConfirmDeleteEspacio({ espacio, onConfirm, onCancel }) {
    // Formatear el precio con 2 decimales
    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2);
    };

    return (
        <Modal show={true} onClose={onCancel}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">
                    Confirmar Eliminación
                </h2>
                <p className="text-center mb-4 text-gray-600">
                    ¿Estás seguro de que deseas eliminar el siguiente espacio?
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                    <p><strong>ID:</strong> {espacio.id}</p>
                    <p><strong>Nombre:</strong> {espacio.nombre}</p>
                    <p><strong>Tipo:</strong> <span className="capitalize">{espacio.tipo}</span></p>
                    {espacio.tipo === 'coworking' && (
                        <p><strong>Escritorios:</strong> {espacio.escritorios?.length || 0}</p>
                    )}
                    <p><strong>Aforo:</strong> {espacio.aforo || 'No especificado'}</p>
                    <p><strong>Precio:</strong> ${formatPrice(espacio.price)}</p>
                    <p>
                        <strong>Estado:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                            espacio.is_active 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'
                        }`}>
                            {espacio.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg mb-4 text-sm text-red-600">
                    <p className="font-semibold">¡Advertencia!</p>
                    <p>Esta acción eliminará permanentemente el espacio y todos sus datos relacionados (incluidos escritorios y reservas asociadas). Esta acción no se puede deshacer.</p>
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