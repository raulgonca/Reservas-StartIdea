import React from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

/**
 * Modal de confirmación para eliminar usuarios
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.user - Usuario a eliminar
 * @param {Function} props.onConfirm - Función para confirmar la eliminación
 * @param {Function} props.onCancel - Función para cancelar la acción
 * @returns {JSX.Element} Modal de confirmación
 */
export default function ConfirmDeleteUser({ user, onConfirm, onCancel }) {
    // Función para mostrar un indicador visual según el rol
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'superadmin':
                return 'text-purple-600 bg-purple-100';
            case 'admin':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-green-600 bg-green-100';
        }
    };

    return (
        <Modal show={true} onClose={onCancel}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">
                    Confirmar Eliminación de Usuario
                </h2>
                <p className="text-center mb-4 text-gray-600">
                    ¿Estás seguro de que deseas eliminar al siguiente usuario?
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Teléfono:</strong> {user.phone}</p>
                    <p><strong>DNI:</strong> {user.dni}</p>
                    <p>
                        <strong>Rol:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getRoleBadgeClass(user.role)}`}>
                            {user.role === 'superadmin' ? 'Superadministrador' : 
                             user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                    </p>
                </div>

                {user.role !== 'user' && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-4 text-sm text-yellow-700">
                        <p className="font-semibold">¡Advertencia!</p>
                        <p>Estás eliminando un usuario con privilegios elevados ({user.role === 'superadmin' ? 'Superadministrador' : 'Administrador'}).</p>
                    </div>
                )}

                <div className="bg-red-50 p-4 rounded-lg mb-4 text-sm text-red-600">
                    <p className="font-semibold">¡Atención!</p>
                    <p>Esta acción eliminará permanentemente al usuario y todas sus asociaciones. Esta acción no se puede deshacer.</p>
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