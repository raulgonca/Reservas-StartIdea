import React from 'react';
import { usePage } from '@inertiajs/react';
import ReservaModal from '@/Components/ReservaModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ReservaEdit() {
  const { props } = usePage();
  const { reserva, users, espacios, escritorios } = props;

  const handleClose = () => {
    // Lógica para cerrar
  };

  const handleSave = () => {
    // Lógica para guardar
  };

  return (
    <AuthenticatedLayout>
      <div>
        <ReservaModal
          reserva={reserva}
          onClose={handleClose}
          onSave={handleSave}
          users={users}
          espacios={espacios}
          escritorios={escritorios}
        />
      </div>
    </AuthenticatedLayout>
  );
}