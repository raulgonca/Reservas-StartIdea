import React, { useRef, useEffect } from 'react';

/**
 * Componente VideoThumbnail
 * Muestra una miniatura de video con un icono de reproducción superpuesto
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.videoUrl - URL del video a mostrar
 * @param {string} [props.className] - Clases CSS adicionales (opcional)
 */
const VideoThumbnail = ({ videoUrl, className = '' }) => {
    // Referencia al elemento video para manipularlo directamente
    const videoRef = useRef(null);

    // Efecto para establecer el frame inicial del video
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Establecer el tiempo al primer frame y pausar
            video.currentTime = 0.1;
            video.pause();
        }
    }, []);

    return (
        <div className={`relative group ${className}`}>
            {/* Elemento video con configuración básica */}
            <video 
                ref={videoRef}
                src={videoUrl}
                preload="metadata"
                muted
                className="w-full h-full object-cover"
            />
            
            {/* Icono de reproducción superpuesto */}
            <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                    className="w-12 h-12 text-white opacity-80 drop-shadow-lg 
                             transform transition-transform duration-200 ease-in-out 
                             group-hover:scale-110" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        </div>
    );
};

export default VideoThumbnail;