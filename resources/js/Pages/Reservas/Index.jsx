import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateReserva from '../ReservasCrud/CreateReserva';
import ReservaList from '../ReservasCrud/ReservasList';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Reservas" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <CreateReserva />
                    <ReservaList />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}