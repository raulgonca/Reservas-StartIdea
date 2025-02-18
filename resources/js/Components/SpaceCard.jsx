import { useState, useEffect } from 'react';

const SpaceCard = ({ space, onOpenModal }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Log para depuración
    useEffect(() => {
        console.log('SpaceCard data:', {
            space: space,
            galleryMedia: space.gallery_media
        });
    }, [space]);

    const handleImageError = (e) => {
        console.error('Error cargando imagen:', {
            espacio: space.nombre,
            rutaOriginal: space.image_url,
            elemento: e.target
        });
        e.target.src = '/storage/images/placeholder.png';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Contenedor de imagen con aspect ratio fijo */}
            <div className="relative pt-[56.25%]"> {/* Aspect ratio 16:9 */}
                <div className="absolute inset-0">
                    {/* Imagen principal */}
                    <img
                        src={space.gallery_media?.[currentImageIndex]?.url || space.image_url}
                        alt={space.nombre}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />

                    {/* Miniaturas */}
                    {space.gallery_media?.length > 1 && (
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto p-1">
                            {space.gallery_media.map((media, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border-2 
                                        ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                                >
                                    <img
                                        src={media.thumbnail}
                                        alt={`${space.nombre} - ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido de la card */}
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.nombre}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{space.descripcion}</p>
                
                <div className="flex justify-between items-center mb-4 text-gray-600">
                    {space.aforo && (
                        <span>Capacidad: {space.aforo} personas</span>
                    )}
                    <span>{space.price}€/hora</span>
                </div>

                <button
                    onClick={() => onOpenModal(space)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                    Ver Detalles
                </button>
            </div>
        </div>
    );
};

export default SpaceCard;