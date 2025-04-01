import React from 'react';

/**
 * Componente que muestra la sección de testimonios de usuarios
 */
export default function TestimonialsSection() {
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A237E]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#90CAF9]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-[#1A237E] rounded-full text-sm font-semibold mb-4">TESTIMONIOS</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                        Lo que dicen nuestros usuarios
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#90CAF9] mx-auto mb-6"></div>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                        Experiencias de personas que confían en nuestros espacios para desarrollar sus proyectos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Testimonio 1 */}
                    <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 relative">
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                            <svg className="h-12 w-12 text-[#1A237E]/10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                        </div>
                        <div className="flex items-center mb-6">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[#1A237E] to-[#283593] flex items-center justify-center text-white font-bold text-xl shadow-md">
                                JD
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-gray-900">Juan Díaz</h4>
                                <p className="text-[#1A237E]">Diseñador UX</p>
                            </div>
                        </div>
                        <p className="text-gray-600 italic mb-4">
                            "Las instalaciones son excelentes y el ambiente de trabajo realmente potencia mi creatividad. He podido conectar con otros profesionales y expandir mi red."
                        </p>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>

                    {/* Testimonio 2 */}
                    <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 relative">
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                            <svg className="h-12 w-12 text-[#1A237E]/10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                        </div>
                        <div className="flex items-center mb-6">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[#1A237E] to-[#283593] flex items-center justify-center text-white font-bold text-xl shadow-md">
                                MR
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-gray-900">María Rodríguez</h4>
                                <p className="text-[#1A237E]">Desarrolladora Full Stack</p>
                            </div>
                        </div>
                        <p className="text-gray-600 italic mb-4">
                            "Desde que trabajo en este coworking mi productividad ha aumentado considerablemente. Los espacios están pensados para favorecer la concentración."
                        </p>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}