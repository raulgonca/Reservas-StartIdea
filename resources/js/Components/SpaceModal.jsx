import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const SpaceModal = ({ isOpen, closeModal, space }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (space) {
            setSelectedImage(space.image_url);
            setImageError(false);
        }
    }, [space]);

    if (!space) return null;

    const handleImageError = (e) => {
        console.error('Error loading image:', e.target.src);
        setImageError(true);
        e.target.src = '/storage/images/placeholder.png';
    };

    return (
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
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                                >
                                    {space.title}
                                </Dialog.Title>

                                {/* Galería de imágenes */}
                                <div className="mb-6">
                                    <div className="aspect-w-16 aspect-h-9 mb-4">
                                        <img
                                            src={selectedImage}
                                            alt={space.title}
                                            className="object-cover w-full h-full rounded-lg"
                                            onError={handleImageError}
                                        />
                                        {imageError && (
                                            <div className="text-red-500 text-sm mt-2">
                                                Error cargando imagen
                                            </div>
                                        )}
                                    </div>

                                    {/* Miniaturas solo si hay galería */}
                                    {space.gallery_images && space.gallery_images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                            {space.gallery_images.map((image, index) => (
                                                <div 
                                                    key={index}
                                                    className="cursor-pointer relative aspect-w-1 aspect-h-1"
                                                    onClick={() => setSelectedImage(image.url)}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={`${space.title} - ${index + 1}`}
                                                        className={`object-cover w-full h-full rounded-lg 
                                                            ${selectedImage === image.url ? 'ring-2 ring-blue-500' : ''}`}
                                                        onError={handleImageError}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Descripción detallada */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2">Descripción</h4>
                                    <p className="text-gray-600">{space.description}</p>
                                </div>

                                {/* Características */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2">Características</h4>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {space.features?.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-600">
                                                <svg
                                                    className="w-5 h-5 mr-2 text-green-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Información adicional */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Capacidad</h4>
                                        <p className="text-gray-600">{space.capacity} personas</p>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Precio</h4>
                                        <p className="text-gray-600">{space.price}€/hora</p>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                        onClick={closeModal}
                                    >
                                        Cerrar
                                    </button>
                                    <Link
                                        href={route('espacios.reserve', space.slug)}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Reservar ahora
                                    </Link>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SpaceModal;