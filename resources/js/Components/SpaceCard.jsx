import React, { useState } from 'react';
import VideoThumbnail from './VideoThumbnail';

/**
 * SpaceCard - Componente que muestra la información de un espacio en formato de tarjeta
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.space - Objeto con los datos del espacio
 * @param {string} props.space.nombre - Nombre del espacio
 * @param {string} props.space.descripcion - Descripción del espacio
 * @param {number} props.space.aforo - Capacidad máxima del espacio
 * @param {string|Array} props.space.features - Características del espacio
 * @param {Array} props.space.gallery_media - Galería de imágenes y videos
 * @param {number} props.space.price - Precio por hora
 * @param {Function} props.onOpenModal - Función para abrir el modal con detalles
 */
const SpaceCard = ({ space = {}, onOpenModal }) => {
    // Control del índice de la imagen actual en la galería
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    /**
     * Maneja los errores de carga de imágenes
     * @param {Event} e - Evento de error
     */
    const handleImageError = (e) => {
        e.target.src = '/placeholder.jpg';
    };

    /**
     * Formatea una hora al formato HH:mm
     * @param {string} time - Hora en formato string
     * @returns {string} Hora formateada
     */
    const formatTime = (time) => {
        return time ? time.slice(0, 5) : '';
    };

    /**
     * Capitaliza la primera letra de un texto
     * @param {string} text - Texto a capitalizar
     * @returns {string} Texto capitalizado
     */
    const capitalize = (text) => {
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
    };

    /**
     * Verifica si el espacio está disponible 24/7
     * @returns {boolean}
     */
    const is24x7 = () => Number(space.disponible_24_7) === 1;

    // Procesamiento mejorado de características (features)
    const features = (() => {
        try {
            // Si es array, usarlo directamente
            if (Array.isArray(space.features)) {
                return space.features;
            }
            
            // Si es string, intentar parsearlo
            if (typeof space.features === 'string') {
                const parsed = JSON.parse(space.features);
                return Array.isArray(parsed) ? parsed : [];
            }
            
            // Si no es ni array ni string, o si es null/undefined
            return [];
        } catch (error) {
            console.error("Error parsing features:", error);
            return [];
        }
    })();

    // Procesamiento mejorado de galería - AQUÍ ESTÁ EL PROBLEMA
    const gallery = (() => {
        // Verificar si gallery_media existe y tiene contenido
        if (space.gallery_media) {
            // Si es un array, usarlo directamente
            if (Array.isArray(space.gallery_media) && space.gallery_media.length > 0) {
                return space.gallery_media;
            }
            
            // Si es un string (JSON), intentar parsearlo
            if (typeof space.gallery_media === 'string') {
                try {
                    const parsed = JSON.parse(space.gallery_media);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (error) {
                    console.error("Error parsing gallery_media:", error);
                }
            }
        }
        
        // Si tenemos imagen principal, crear un item de galería con ella
        if (space.image_url || space.image) {
            return [{ 
                url: space.image_url || space.image, 
                type: 'image' 
            }];
        }
        
        return [];
    })();

    // No renderizar si no hay datos del espacio
    if (!space) return null;

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-[1.02]"
            onClick={() => onOpenModal(space)}
        >
            {/* Sección de Galería */}
            <div className="relative h-64 bg-white">
                {/* Visualizador principal de imagen/video */}
                {gallery[currentImageIndex]?.type === 'video' ? (
                    <VideoThumbnail
                        videoUrl={gallery[currentImageIndex].url}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={gallery[currentImageIndex]?.url || space.image_url || space.image || '/placeholder.jpg'}
                        alt={space.nombre}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                )}

                {/* Miniaturas de la galería */}
                {gallery.length > 1 && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto p-1">
                        {gallery.map((media, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                }}
                                className={`w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border-2
                                    ${currentImageIndex === index ? 'border-blue-500' : 'border-white/50'}`}
                            >
                                {media.type === 'video' ? (
                                    <VideoThumbnail
                                        videoUrl={media.url}
                                        thumbnailUrl={media.thumbnail}
                                        className="w-full h-full object-cover"
                                    />
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

            {/* Sección de Información */}
            <div className="p-4 space-y-4">
                {/* Encabezado con nombre y tipo */}
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {space.nombre}
                    </h3>
                    {space.tipo && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {capitalize(space.tipo)}
                        </span>
                    )}
                </div>

                {/* Descripción del espacio */}
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[4em]">
                    {space.descripcion}
                </p>

                {/* Información Principal en grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* Aforo - Solo si existe */}
                    {space.aforo && (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Aforo: {space.aforo}</span>
                        </div>
                    )}
                </div>

                {/* Características con mejor UI */}
                {features.length > 0 && (
                    <div className="mt-3">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="flex items-center gap-2 px-3 py-2 mt-1 mb-1 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-blue-100 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="truncate">{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pie: Precio y Botón de acción */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">Desde</span>
                        <span className="text-blue-600 font-semibold text-lg">{space.price}€/hora</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal(space);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Ver detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpaceCard;