import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const SpaceCard = ({ space, onOpenModal }) => {
    useEffect(() => {
        console.log('SpaceCard data:', {
            space: space,
            imageUrl: space.image_url
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
            <div className="aspect-w-16 aspect-h-9">
                <img
                    src={space.image_url}
                    alt={space.nombre}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.nombre}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{space.descripcion}</p>
                
                {/* Capacidad y Precio */}
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