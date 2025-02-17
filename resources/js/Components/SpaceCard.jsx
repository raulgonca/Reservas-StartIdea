import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function SpaceCard({ 
    title, 
    description, 
    image, 
    features, 
    capacity, 
    price, 
    slug,
    buttonText = "Ver Detalles",
    buttonLink = null,
    buttonAction = null,
    className = ""
}) {
    const [isHovered, setIsHovered] = useState(false);

    const ButtonComponent = buttonLink ? Link : 'button';
    const buttonProps = buttonLink 
        ? { href: buttonLink }
        : { onClick: buttonAction };

    return (
        <div 
            className={`relative group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Imagen del espacio */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
            </div>

            {/* Contenido */}
            <div className="p-6">
                <h3 className="text-2xl font-montserrat font-bold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 mb-4">
                    {description}
                </p>

                {/* Características */}
                <div className="space-y-2 mb-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2 text-[#1A237E]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            {feature}
                        </div>
                    ))}
                </div>

                {/* Información adicional */}
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                        <span className="font-semibold">Capacidad:</span> {capacity}
                    </div>
                    <div className="text-lg font-bold text-[#1A237E]">
                        {price}€/hora
                    </div>
                </div>

                {/* Botón de acción dinámico */}
                <ButtonComponent
                    {...buttonProps}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#1A237E] hover:bg-[#283593] transition-colors duration-300"
                >
                    {buttonText}
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </ButtonComponent>
            </div>
        </div>
    );
}