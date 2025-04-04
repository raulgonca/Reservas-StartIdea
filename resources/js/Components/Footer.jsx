import React from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { FaInstagram, FaFacebookF, FaMapMarkerAlt, FaEnvelope, FaPhone, FaChevronRight,  FaWhatsapp } from "react-icons/fa";

// Access environment variables
const whatsappLink = import.meta.env.VITE_WHATSAPP_URL;
const instagramLink = import.meta.env.VITE_INSTAGRAM_URL;
const facebookLink = import.meta.env.VITE_FACEBOOK_URL;

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-[#1A237E] to-[#283593] text-white py-12 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#90CAF9] to-[#42A5F5]"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500 opacity-10"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-indigo-300 opacity-10"></div>
            
            {/* Botón flotante de WhatsApp */}
            <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Contactar por WhatsApp"
            >
                <FaWhatsapp className="h-6 w-6" />
            </a>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo y descripción */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="transform transition-transform duration-300 group-hover:rotate-12">
                                <ApplicationLogo className="h-10 w-10 fill-current text-white" />
                            </div>
                            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">StartIdea</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                            HUB de Innovación Social dedicado a impulsar el emprendimiento y la creatividad en nuestra comunidad.
                        </p>
                        <div className="mt-4 flex items-center space-x-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-sm text-green-300">Espacios disponibles ahora</span>
                        </div>
                    </div>

                    {/* Enlaces rápidos */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold mb-4 text-white relative inline-block">
                            Enlaces rápidos
                            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#90CAF9]"></span>
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#espacios" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center hover:translate-x-1">
                                    <FaChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span>Espacios</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://startidea.es/" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center hover:translate-x-1">
                                    <FaChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span>Eventos</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center hover:translate-x-1">
                                    <FaChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span>Preguntas frecuentes</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold mb-4 text-white relative inline-block">
                            Contacto
                            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#90CAF9]"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-center text-gray-300 group">
                                <div className="mr-3 p-2 bg-blue-900/30 rounded-full group-hover:bg-blue-800/50 transition-colors duration-300">
                                    <FaMapMarkerAlt className="h-4 w-4" />
                                </div>
                                <span className="group-hover:text-white transition-colors duration-300">Calle Conde Cifuentes 33, Granada</span>
                            </li>
                            <li className="flex items-center text-gray-300 group">
                                <div className="mr-3 p-2 bg-blue-900/30 rounded-full group-hover:bg-blue-800/50 transition-colors duration-300">
                                    <FaEnvelope className="h-4 w-4" />
                                </div>
                                <span className="group-hover:text-white transition-colors duration-300">info@startidea.com</span>
                            </li>
                            <li className="flex items-center text-gray-300 group">
                                <div className="mr-3 p-2 bg-blue-900/30 rounded-full group-hover:bg-blue-800/50 transition-colors duration-300">
                                    <FaPhone className="h-4 w-4" />
                                </div>
                                <span className="group-hover:text-white transition-colors duration-300">958 04 57 89</span>
                            </li>
                        </ul>
                    </div>

                    {/* Redes sociales y newsletter */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold mb-4 text-white relative inline-block">
                            Síguenos
                            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#90CAF9]"></span>
                        </h3>
                        <div className="flex space-x-3 mb-6">
                            {/* instagram */}
                            <a href={instagramLink} className="text-gray-300 hover:text-white p-2 bg-blue-900/30 rounded-full hover:bg-blue-800/50 transition-all duration-300 hover:scale-110">
                                <FaInstagram className="h-5 w-5" />
                            </a>
                            {/* facebook */}
                            <a href={facebookLink} className="text-gray-300 hover:text-white p-2 bg-blue-900/30 rounded-full hover:bg-blue-800/50 transition-all duration-300 hover:scale-110">
                                <FaFacebookF className="h-5 w-5" />
                            </a>
                        </div>
                        
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-300 text-sm mb-4 md:mb-0 flex items-center">
                        <span className="mr-2">© {new Date().getFullYear()}</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 font-medium">HUB de Innovación Social StartIdea</span>
                        <span className="ml-2">Todos los derechos reservados.</span>
                    </div>
                    <div className="flex space-x-6">
                        <p className="text-gray-300 hover:text-white text-sm transition-colors duration-300 hover:underline decoration-[#90CAF9] underline-offset-4">
                            Política de Privacidad
                        </p>
                        <p className="text-gray-300 hover:text-white text-sm transition-colors duration-300 hover:underline decoration-[#90CAF9] underline-offset-4">
                            Términos de Servicio
                        </p>
                        <p className="text-gray-300 hover:text-white text-sm transition-colors duration-300 hover:underline decoration-[#90CAF9] underline-offset-4">
                            Cookies
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}