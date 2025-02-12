import React from 'react';
import { usePage, router } from '@inertiajs/react';
import ReservaModal from '@/Components/ReservaModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ReservaEdit() {
    const { props } = usePage();
    const { reserva, users, espacios, escritorios } = props;

    const handleClose = () => {
        router.visit(route('superadmin.reservas.index'));
    };

    return (
        <AuthenticatedLayout>
            <div>
                <ReservaModal
                    reserva={reserva}
                    onClose={handleClose}
                    users={users}
                    espacios={espacios}
                    escritorios={escritorios}
                />
            </div>
        </AuthenticatedLayout>
    );
}