import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserForm from '@/Components/Users/UserForm';
import useToast from '@/Hooks/useToast';
import { toast } from 'react-toastify';

/**
 * Vista para editar un usuario existente
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.user - Usuario a editar
 * @param {boolean} props.canAssignRoles - Si el usuario puede asignar roles
 * @param {Object} props.auth - Datos de autenticación
 * @returns {JSX.Element} Vista de edición de usuario
 */
export default function EditUser({ user, canAssignRoles, auth }) {
    // Inicializar el hook de notificaciones automáticas
    useToast();
    
    // Inicializar el formulario con los datos del usuario actual
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dni: user.dni || '',
        password: '', // Vacío por defecto en modo edición
        password_confirmation: '',
        role: user.role || 'user'
    });

    /**
     * Manejar el envío del formulario
     * 
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Mostrar toast de carga durante el procesamiento
        const toastId = toast.loading(`Actualizando usuario: ${user.name}`);
        
        // Determinar la ruta correcta según el rol del usuario
        const routeName = auth.user.role === 'superadmin' 
            ? 'superadmin.users.update' 
            : 'admin.users.update';
            
        patch(route(routeName, user.id), {
            onSuccess: () => {
                // Actualizar notificación a éxito
                toast.update(toastId, {
                    render: `Usuario ${user.name} actualizado correctamente`,
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                });
            },
            onError: (errors) => {
                // Actualizar notificación a error con el primer mensaje de error
                const errorMessage = Object.values(errors)[0] || "Error al actualizar el usuario";
                toast.update(toastId, {
                    render: errorMessage,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
            }
        });
    };

    /**
     * Cancelar edición y volver atrás
     */
    const handleCancel = () => {
        const routeName = auth.user.role === 'superadmin' 
            ? 'superadmin.users.index' 
            : 'admin.users.index';
            
        window.location = route(routeName);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Editar Usuario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Editar Usuario
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Actualice la información del usuario ID: {user.id}
                                </p>

                                {/* Información adicional para contexto */}
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Usuario:</span> {user.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Email:</span> {user.email}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Creado:</span> {new Date(user.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Usar el componente de formulario reutilizable */}
                            <UserForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isEditMode={true}
                                canAssignRoles={canAssignRoles}
                            />
                            
                            {/* Advertencia para contraseña */}
                            <div className="mt-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                    * Si no desea cambiar la contraseña, deje los campos de contraseña vacíos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}