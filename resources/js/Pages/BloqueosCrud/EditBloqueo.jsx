import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BloqueoForm from './BloqueoForm';

export default function EditBloqueo({ bloqueo, espacios, escritorios }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Editar Bloqueo #${bloqueo.id}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <BloqueoForm 
                        bloqueo={bloqueo} 
                        espacios={espacios} 
                        escritorios={escritorios} 
                        mode="edit" 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}