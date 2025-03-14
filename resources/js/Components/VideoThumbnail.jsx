import React, { useRef, useState, useEffect } from 'react';

/**
 * Componente VideoThumbnail mejorado
 * Muestra una miniatura de video con un icono de reproducción superpuesto
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.videoUrl - URL del video a mostrar
 * @param {string} [props.thumbnailUrl] - URL de miniatura preexistente (opcional)
 * @param {string} [props.className] - Clases CSS adicionales (opcional)
 */
const VideoThumbnail = ({ videoUrl, thumbnailUrl, className = '' }) => {
    // Estado para controlar errores de carga
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Referencia al elemento video para manipularlo directamente
    const videoRef = useRef(null);

    // Efecto para establecer el frame inicial del video si no hay thumbnailUrl
    useEffect(() => {
        // Si tenemos una miniatura específica, no necesitamos cargar el video
        if (thumbnailUrl) {
            setIsLoaded(true);
            return;
        }
        
        const video = videoRef.current;
        if (video) {
            // Manejar eventos de carga y error
            const handleLoadedData = () => {
                try {
                    // Establecer el tiempo al primer frame y pausar
                    video.currentTime = 0.1;
                    video.pause();
                    setIsLoaded(true);
                } catch (err) {
                    console.error('Error al establecer frame del video:', err);
                    setHasError(true);
                }
            };
            
            const handleError = () => {
                console.error('Error al cargar el video:', videoUrl);
                setHasError(true);
            };
            
            video.addEventListener('loadeddata', handleLoadedData);
            video.addEventListener('error', handleError);
            
            return () => {
                video.removeEventListener('loadeddata', handleLoadedData);
                video.removeEventListener('error', handleError);
            };
        }
    }, [videoUrl, thumbnailUrl]);

    // Si hay una miniatura específica proporcionada, la usamos
    if (thumbnailUrl) {
        return (
            <div className={`relative group ${className}`}>
                <img 
                    src={thumbnailUrl} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
                
                {/* Icono de reproducción */}
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
    }

    // Fallback para errores de carga
    if (hasError) {
        return (
            <div className={`relative group ${className} flex items-center justify-center bg-gray-200`}>
                <svg 
                    className="w-12 h-12 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
            </div>
        );
    }

    // Renderizado normal con video
    return (
        <div className={`relative group ${className}`}>
            {/* Video elemento principal */}
            <video 
                ref={videoRef}
                src={videoUrl}
                preload="metadata"
                muted
                className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Indicador de carga si aún no se ha cargado */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <svg 
                        className="w-8 h-8 text-gray-400 animate-spin" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" cy="12" r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        ></circle>
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </div>
            )}
            
            {/* Icono de reproducción superpuesto */}
            {isLoaded && (
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
            )}
        </div>
    );
};

export default VideoThumbnail;