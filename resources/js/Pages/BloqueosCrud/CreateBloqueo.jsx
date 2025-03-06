import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BloqueoForm from './BloqueoForm';

export default function CreateBloqueo(props) {
    const { espacios = [], escritorios = [] } = props;
    const { errors } = usePage().props;
    
    // Manejar errores de forma más robusta
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach(error => {
                toast.error(error, { toastId: `error-${Date.now()}` });
            });
        }
    }, [errors]);

    return (
        <AuthenticatedLayout>
            <Head title="Crear Bloqueo" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <BloqueoForm 
                        espacios={espacios} 
                        escritorios={escritorios} 
                        mode="create" 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}