import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// NOTA: Este componente ya no se usa directamente. Cada página maneja sus propias notificaciones toast
export default function FlashMessage() {
    // Este componente queda como referencia pero ya no se utiliza para evitar mensajes duplicados
    return null;
}