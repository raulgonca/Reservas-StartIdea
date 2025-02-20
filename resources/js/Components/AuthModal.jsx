import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from '@inertiajs/react';

/**
 * Modal para gestionar el flujo de autenticación
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.closeModal - Función para cerrar el modal
 * @param {number} props.spaceId - ID del espacio seleccionado
 */
const AuthModal = ({ isOpen, closeModal, spaceId }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                {/* Overlay del modal */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/75" />
                </Transition.Child>

                {/* Contenedor principal */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {/* Título del modal */}
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl font-bold text-gray-900 mb-4 text-center"
                                >
                                    Para realizar una reserva
                                </Dialog.Title>

                                {/* Opciones de autenticación */}
                                <div className="mt-4 space-y-4">
                                    {/* Botón de inicio de sesión */}
                                    <Link
                                        href={route('login', { 
                                            redirect: route('user.reservas.create', { espacio_id: spaceId }) 
                                        })}
                                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                                        onClick={closeModal}
                                    >
                                        Ya tengo una cuenta
                                    </Link>

                                    {/* Botón de registro */}
                                    <Link
                                        href={route('register', { 
                                            redirect: route('user.reservas.create', { espacio_id: spaceId }) 
                                        })}
                                        className="w-full flex items-center justify-center px-4 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition"
                                        onClick={closeModal}
                                    >
                                        Crear una cuenta nueva
                                    </Link>
                                </div>

                                {/* Botón de cancelar */}
                                <button
                                    type="button"
                                    className="mt-4 w-full flex items-center justify-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AuthModal;