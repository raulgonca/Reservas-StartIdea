import React from 'react';

/**
 * Componente que muestra la sección de preguntas frecuentes
 */
export default function FaqSection() {
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-[#1A237E] rounded-full text-sm font-semibold mb-4">FAQ</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                        Preguntas Frecuentes
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#90CAF9] mx-auto mb-6"></div>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                        Resolvemos tus dudas más comunes sobre nuestros espacios y servicios
                    </p>
                </div>

                <div className="max-w-3xl mx-auto divide-y divide-gray-200">
                    {/* Pregunta 1 */}
                    <div className="py-6">
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span className="text-lg text-gray-900">¿Cuáles son los horarios de acceso?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </span>
                            </summary>
                            <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                Nuestros espacios están disponibles de lunes a viernes de 8:00 a 20:00 horas. Los fines de semana ofrecemos acceso limitado de 9:00 a 14:00 horas, previa reserva.
                            </p>
                        </details>
                    </div>

                    {/* Pregunta 2 */}
                    <div className="py-6">
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span className="text-lg text-gray-900">¿Cómo puedo reservar un espacio?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </span>
                            </summary>
                            <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                Para reservar un espacio, debes registrarte en nuestra plataforma y seleccionar el espacio que deseas utilizar. Puedes hacer reservas con hasta 2 semanas de antelación.
                            </p>
                        </details>
                    </div>

                    {/* Pregunta 3 */}
                    <div className="py-6">
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span className="text-lg text-gray-900">¿Qué servicios incluyen los espacios?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </span>
                            </summary>
                            <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                Todos nuestros espacios incluyen WiFi de alta velocidad, acceso a zonas comunes, café y agua ilimitados. Dependiendo del tipo de espacio, también pueden incluir servicios adicionales como proyector, pizarra, o equipamiento específico.
                            </p>
                        </details>
                    </div>

                    {/* Pregunta 4 */}
                    <div className="py-6">
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span className="text-lg text-gray-900">¿Ofrecen descuentos para uso recurrente?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </span>
                            </summary>
                            <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                Sí, contamos con planes mensuales y trimestrales que ofrecen descuentos significativos para quienes utilizan nuestros espacios de forma regular. Consulta nuestros planes para más detalles.
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        </section>
    );
}