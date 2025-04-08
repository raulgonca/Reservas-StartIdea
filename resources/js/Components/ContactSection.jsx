import React, { useState, useRef } from 'react';
import emailjs from 'emailjs-com';

export default function ContactSection() {
    const [formStatus, setFormStatus] = useState({
        submitting: false,
        success: false,
        error: false,
        message: ''
    });

    const form = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus({ submitting: true, success: false, error: false, message: '' });

        // Recopilar los datos del formulario
        const formData = new FormData(form.current);
        const user_name = formData.get('user_name');
        const user_email = formData.get('user_email');
        const message = formData.get('message');

        // Enviar formulario a EmailJS
        emailjs
            .sendForm(
                'service_2n2v36r',   // Tu Service ID
                'template_5xc09wx',    // Tu Template ID
                form.current,          // El formulario que contiene los datos
                'wYO_BwXL7pHnI5n9P'    // Tu User ID (generado por EmailJS)
            )
            .then(
                (result) => {
                    setFormStatus({
                        submitting: false,
                        success: true,
                        error: false,
                        message: 'Mensaje enviado con éxito.'
                    });
                    form.current.reset();
                },
                (error) => {
                    setFormStatus({
                        submitting: false,
                        success: false,
                        error: true,
                        message: `Error: ${error.text || 'Hubo un error al enviar el mensaje'}`
                    });
                }
            );
    };

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#1A237E]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#90CAF9]/5 rounded-full translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-[#1A237E] rounded-full text-sm font-semibold mb-4">CONTACTO</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                        ¿Hablamos?
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#90CAF9] mx-auto mb-6"></div>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                        Estamos aquí para resolver tus dudas y ayudarte a encontrar el espacio perfecto para tus necesidades
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Formulario de contacto */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        {formStatus.success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{formStatus.message}</span>
                                </div>
                            </div>
                        )}

                        {formStatus.error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formStatus.message}</span>
                                </div>
                            </div>
                        )}

                        <form className="space-y-6" ref={form} onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                                <input
                                    type="text"
                                    id="user_name"
                                    name="user_name"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-[#1A237E] focus:border-[#1A237E] transition-colors duration-200 text-gray-900"
                                    placeholder="Tu nombre"
                                    required
                                    disabled={formStatus.submitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                                <input
                                    type="email"
                                    id="user_email"
                                    name="user_email"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-[#1A237E] focus:border-[#1A237E] transition-colors duration-200 text-gray-900"
                                    placeholder="tu@email.com"
                                    required
                                    disabled={formStatus.submitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-[#1A237E] focus:border-[#1A237E] transition-colors duration-200 text-gray-900"
                                    placeholder="¿En qué podemos ayudarte?"
                                    required
                                    disabled={formStatus.submitting}
                                ></textarea>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[#1A237E] to-[#283593] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:ring-opacity-50 disabled:opacity-70"
                                    disabled={formStatus.submitting}
                                >
                                    {formStatus.submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : "Enviar mensaje"}
                                </button>
                            </div>
                        </form>

                        {/* Contact Info Below Form */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>info@startidea.es</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>958 04 57 89</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Map Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                        <div className="p-4 bg-[#1A237E] text-white">
                            <h3 className="font-semibold flex items-center">
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Calle Conde Cifuentes 33, 18005, Granada
                            </h3>
                        </div>
                        <div className="flex-grow">
                            {/* Google Maps iframe */}
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3178.4752285869354!2d-3.6026187!3d37.1784913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd71fcb7977fb33d%3A0x5c4be3a4b88d4b76!2sCalle%20Conde%20Cifuentes%2C%2033%2C%2018005%20Granada!5e0!3m2!1ses!2ses!4v1652345678901!5m2!1ses!2ses" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación de StartIdea"
                                className="filter grayscale hover:grayscale-0 transition-all duration-300 h-full"
                            ></iframe>
                        </div>
                        <div className="p-3 bg-gray-50">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-700">
                                    <svg className="h-4 w-4 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Lun-Vie: 8:00-20:00</span>
                                </div>
                                <a 
                                    href="https://goo.gl/maps/YourActualGoogleMapsLink" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#1A237E] hover:underline flex items-center"
                                >
                                    <span>Ver en Google Maps</span>
                                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
