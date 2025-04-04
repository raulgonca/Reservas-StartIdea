import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import VideoThumbnail from './VideoThumbnail';
import AuthModal from './AuthModal';
import SpaceAvailability from './SpaceAvailability';

/**
 * Componente modal para mostrar detalles de un espacio y gestionar reservas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.closeModal - Función para cerrar el modal
 * @param {Object} props.space - Datos del espacio a mostrar
 */
const SpaceModal = ({ isOpen, closeModal, space }) => {
    const { auth } = usePage().props;
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (!space) return null;

    const handleReservarClick = () => {
        if (!auth.user) {
            setShowAuthModal(true);
        } else {
            router.visit(route('user.reservas.create', {
                espacio_id: space.id
            }));
            closeModal();
        }
    };

    const handleCloseAuthModal = () => {
        setShowAuthModal(false);
    };

    return (
        <>
            <AuthModal
                isOpen={showAuthModal}
                closeModal={handleCloseAuthModal}
                spaceId={space.id}
            />

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
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

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-xl transition-all">
                                    {/* Visualizador de media principal */}
                                    <div className="relative mb-4 sm:mb-6 h-80 bg-white">
                                        {space.gallery_media?.[currentMediaIndex]?.type === 'video' ? (
                                            <video
                                                src={space.gallery_media[currentMediaIndex].url}
                                                className="w-full h-full object-cover rounded-lg"
                                                controls
                                                poster={space.gallery_media[currentMediaIndex].thumbnail}
                                            />
                                        ) : (
                                            <img
                                                src={space.gallery_media?.[currentMediaIndex]?.url || space.image_url}
                                                alt={space.nombre}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        )}
                                    </div>

                                    {/* Galería de miniaturas responsive */}
                                    {space.gallery_media?.length > 1 && (
                                        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                            {space.gallery_media.map((media, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentMediaIndex(index)}
                                                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all
                                                    ${currentMediaIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                                                >
                                                    {media.type === 'video' ? (
                                                        <VideoThumbnail 
                                                            videoUrl={media.url} 
                                                            thumbnailUrl={media.thumbnail}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={media.url}
                                                            alt={`${space.nombre} - ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Información del espacio */}
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4"
                                    >
                                        {space.nombre}
                                    </Dialog.Title>

                                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                        {space.descripcion}
                                    </p>

                                    {/* Detalles adicionales responsive */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        {space.aforo && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <h4 className="text-sm sm:text-base font-semibold text-gray-900">Capacidad</h4>
                                                <p className="text-sm sm:text-base text-gray-600">{space.aforo} personas</p>
                                            </div>
                                        )}
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Precio</h4>
                                            <p className="text-sm sm:text-base text-gray-600">{space.price}€/hora</p>
                                        </div>
                                    </div>

                                    <SpaceAvailability space={space} />

                                    {/* Botones de acción responsive */}
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
                                        <button
                                            type="button"
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                            onClick={closeModal}
                                        >
                                            Cerrar
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                            onClick={handleReservarClick}
                                        >
                                            {auth.user ? 'Realizar Reserva' : 'Reservar Ahora'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default SpaceModal;