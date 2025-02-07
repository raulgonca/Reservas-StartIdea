import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FlashMessage = () => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.errors) {
            // Iterar sobre los errores y mostrar cada uno
            Object.values(flash.errors).forEach(error => {
                toast.error(error);
            });
        }
    }, [flash]);

    return <ToastContainer />;
};

export default FlashMessage;