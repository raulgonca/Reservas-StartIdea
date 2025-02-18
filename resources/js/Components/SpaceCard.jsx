import React, { useState, useEffect } from 'react';
import VideoThumbnail from './VideoThumbnail';

/**
 * Componente SpaceCard
 * Muestra una tarjeta con la información de un espacio y su galería de medios
 * 
 * @param {Object} props
 * @param {Object} props.space - Datos del espacio
 * @param {Function} props.onOpenModal - Función para abrir el modal del espacio
 */
const SpaceCard = ({ space, onOpenModal }) => {
    // Estado para controlar el índice de la imagen/video actual
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Log para depuración de la galería de medios
    useEffect(() => {
        console.log('Space media:', space.gallery_media);
    }, [space]);

    // Manejador de errores para imágenes
    const handleImageError = (e) => {
        console.error('Error loading image:', e);
        e.target.src = '/placeholder.jpg';
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-[1.02]"
            onClick={() => onOpenModal(space)}
        >
            {/* Contenedor principal de imagen/video */}
            <div className="relative aspect-video bg-gray-100">
                {space.gallery_media?.[currentImageIndex]?.type === 'video' ? (
                    <VideoThumbnail 
                        videoUrl={space.gallery_media[currentImageIndex].url}
                        className="w-full h-full"
                    />
                ) : (
                    <img
                        src={space.gallery_media?.[currentImageIndex]?.url || space.image_url}
                        alt={space.nombre}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                )}

                {/* Miniaturas superpuestas */}
                {space.gallery_media?.length > 1 && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto p-1">
                        {space.gallery_media.map((media, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                }}
                                className={`w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border-2
                                    ${currentImageIndex === index ? 'border-blue-500' : 'border-white/50'}`}
                            >
                                {media.type === 'video' ? (
                                    <VideoThumbnail videoUrl={media.url} />
                                ) : (
                                    <img
                                        src={media.url}
                                        alt={`${space.nombre} - ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Información del espacio */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {space.nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {space.descripcion}
                </p>
                <div className="flex justify-between items-center">
                    {space.aforo && (
                        <span className="text-sm text-gray-500">
                            Hasta {space.aforo} personas
                        </span>
                    )}
                    <span className="text-blue-600 font-semibold">
                        {space.price}€/hora
                    </span>
                </div>

                {/* Botones de acción */}
                <div className="mt-4 flex justify-end gap-2">
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal(space); // Abre el modal con la información completa
                        }}
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Ver más
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpaceCard;