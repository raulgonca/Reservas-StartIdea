import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserForm from '@/Components/Users/UserForm';
import useToast from '@/Hooks/useToast';
import { toast } from 'react-toastify';

/**
 * Vista para crear un nuevo usuario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.canAssignRoles - Si el usuario puede asignar roles
 * @param {Object} props.auth - Datos de autenticación
 * @returns {JSX.Element} Vista de creación de usuario
 */
export default function CreateUser({ canAssignRoles, auth }) {
    // Inicializar el hook de notificaciones automáticas
    useToast();
    
    // Inicializar el formulario con Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        dni: '',
        password: '',
        password_confirmation: '',
        role: 'user' // Valor predeterminado
    });

    /**
     * Manejar el envío del formulario
     * 
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Mostrar toast de carga durante el procesamiento
        const toastId = toast.loading("Creando nuevo usuario...");
        
        // Determinar la ruta correcta según el rol del usuario
        const routeName = auth.user.role === 'superadmin' 
            ? 'superadmin.users.store' 
            : 'admin.users.store';
            
        post(route(routeName), {
            onSuccess: () => {
                // Limpiar formulario
                reset();
                
                // Actualizar notificación a éxito
                toast.update(toastId, {
                    render: "Usuario creado exitosamente",
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                });
            },
            onError: (errors) => {
                // Actualizar notificación a error con el primer mensaje de error
                const errorMessage = Object.values(errors)[0] || "Error al crear el usuario";
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
     * Cancelar creación y volver atrás
     */
    const handleCancel = () => {
        const routeName = auth.user.role === 'superadmin' 
            ? 'superadmin.users.index' 
            : 'admin.users.index';
            
        window.location = route(routeName);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Crear Usuario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Crear Nuevo Usuario
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Complete el formulario para añadir un nuevo usuario al sistema.
                                </p>
                            </div>

                            {/* Usar el componente de formulario reutilizable */}
                            <UserForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isEditMode={false}
                                canAssignRoles={canAssignRoles}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}