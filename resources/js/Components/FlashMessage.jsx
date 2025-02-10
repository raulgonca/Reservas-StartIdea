import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useRef } from 'react';

const FlashMessage = ({ messages }) => {
    const lastMessageRef = useRef({});

    useEffect(() => {
        if (messages) {
            // Verifica si el mensaje ha cambiado
            if (messages.success && lastMessageRef.current.success !== messages.success) {
                toast.success(messages.success);
                lastMessageRef.current.success = messages.success;
            }

            if (messages.error && lastMessageRef.current.error !== messages.error) {
                if (typeof messages.error === 'object' && Object.keys(messages.error).length > 0) {
                    Object.values(messages.error).forEach(error => {
                        toast.error(error);
                    });
                } else {
                    toast.error(messages.error);
                }
                lastMessageRef.current.error = messages.error;
            }

            if (messages.warning && lastMessageRef.current.warning !== messages.warning) {
                toast.warning(messages.warning);
                lastMessageRef.current.warning = messages.warning;
            }

            if (messages.info && lastMessageRef.current.info !== messages.info) {
                toast.info(messages.info);
                lastMessageRef.current.info = messages.info;
            }
        }
    }, [messages]);

};

export default FlashMessage;