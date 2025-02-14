import React from 'react';
import { usePage, router } from '@inertiajs/react';
import ReservaModal from '@/Components/ReservaModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ReservaEdit() {
    const { props } = usePage();
    const { reserva, users, espacios, escritorios, successMessage } = props;

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
                    horaInicio={reserva.hora_inicio} // Asegurarse de pasar hora_inicio
                    horaFin={reserva.hora_fin} // Asegurarse de pasar hora_fin
                />
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}