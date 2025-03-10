import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para manejar notificaciones toast automáticamente
 * Detecta mensajes flash y errores de validación
 */
export default function useToast() {
    const { flash, errors } = usePage().props;
    
    useEffect(() => {
        // Manejar mensajes flash de éxito
        if (flash.success) {
            toast.success(flash.success);
        }
        
        // Manejar mensajes flash de error
        if (flash.error) {
            toast.error(flash.error);
        }
        
        // Manejar mensajes flash personalizados con tipo
        if (flash.toast) {
            const { type, message } = flash.toast;
            
            switch (type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                    toast.error(message);
                    break;
                case 'info':
                    toast.info(message);
                    break;
                case 'warning':
                    toast.warning(message);
                    break;
                default:
                    toast(message);
            }
        }
        
        // Mostrar el primer error de validación si hay alguno
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
        }
    }, [flash, errors]);

    // Devolver la función toast para uso directo si es necesario
    return { toast };
}