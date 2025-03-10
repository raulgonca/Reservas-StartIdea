import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

/**
 * Componente reutilizable de formulario para usuarios (crear y editar)
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos del formulario
 * @param {Function} props.setData - Función para actualizar datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.processing - Si el formulario está procesando
 * @param {Function} props.onSubmit - Función para manejar el envío
 * @param {Function} props.onCancel - Función para cancelar
 * @param {boolean} props.isEditMode - Si es modo edición
 * @param {boolean} props.canAssignRoles - Si el usuario puede asignar roles
 * @returns {JSX.Element} Componente de formulario
 */
export default function UserForm({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    onCancel,
    isEditMode = false,
    canAssignRoles = false
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
            <div>
                <InputLabel htmlFor="name" value="Nombre" />
                <TextInput
                    id="name"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoFocus
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="email" value="Correo electrónico" />
                <TextInput
                    id="email"
                    type="email"
                    className="mt-1 block w-full"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                />
                <InputError message={errors.email} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="phone" value="Teléfono" />
                <TextInput
                    id="phone"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    required
                    placeholder="Ej: 612345678"
                />
                <InputError message={errors.phone} className="mt-2" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Debe comenzar con 6, 7, 8 o 9 y tener 9 dígitos.
                </p>
            </div>

            <div>
                <InputLabel htmlFor="dni" value="DNI" />
                <TextInput
                    id="dni"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.dni}
                    onChange={(e) => setData('dni', e.target.value)}
                    required
                    placeholder="Ej: 12345678A"
                />
                <InputError message={errors.dni} className="mt-2" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Formato: 8 dígitos seguidos de 1 letra.
                </p>
            </div>

            <div>
                <InputLabel htmlFor="password" value="Contraseña" />
                <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="mt-1 block w-full"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required={!isEditMode}
                    autoComplete="new-password"
                />
                <InputError message={errors.password} className="mt-2" />
                {isEditMode && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Deja en blanco para mantener la contraseña actual.
                    </p>
                )}
            </div>

            <div>
                <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                <TextInput
                    id="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    className="mt-1 block w-full"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    required={!isEditMode && data.password}
                />
                <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div className="block mt-4">
                <label className="flex items-center">
                    <Checkbox 
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Mostrar contraseña
                    </span>
                </label>
            </div>

            {canAssignRoles && (
                <div>
                    <InputLabel htmlFor="role" value="Rol" />
                    <select
                        id="role"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        required
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                        <option value="superadmin">Superadministrador</option>
                    </select>
                    <InputError message={errors.role} className="mt-2" />
                </div>
            )}

            <div className="flex items-center justify-end mt-4 gap-4">
                <SecondaryButton onClick={onCancel} type="button">
                    Cancelar
                </SecondaryButton>
                <PrimaryButton disabled={processing}>
                    {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                </PrimaryButton>
            </div>
        </form>
    );
}