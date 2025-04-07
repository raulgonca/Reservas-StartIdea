import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import SpaceCard from "@/Components/SpaceCard";
import SpaceModal from "@/Components/SpaceModal";
import Footer from "@/Components/Footer";
import { useState, useEffect } from "react";
import ContactSection from "@/Components/ContactSection";
import FaqSection from "@/Components/FaqSection";
import TestimonialsSection from "@/Components/TestimonialsSection";

/**
 * Componente principal Welcome que renderiza la página de inicio
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.auth - Información de autenticación del usuario
 * @param {string} props.laravelVersion - Versión actual de Laravel
 * @param {string} props.phpVersion - Versión actual de PHP
 * @param {Array} props.espacios - Lista de espacios disponibles
 */
export default function Welcome({ auth, espacios = [] }) {
    // Estados para control de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isHeaderSolid, setIsHeaderSolid] = useState(false);

    // Manejadores de modal
    const openModal = (space) => {
        setSelectedSpace(space);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSpace(null);
    };

    // Efecto para controlar el scroll y cambiar el estilo del header
    useEffect(() => {
        const handleScroll = () => {
            const position = window.scrollY;
            setScrollPosition(position);
            setIsHeaderSolid(position > 50);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <Head title="Reservas" />
            <SpaceModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                space={selectedSpace}
            />
            <div className="flex flex-col min-h-screen bg-gray-50 text-white">
                {/* Header Responsive con transición basada en scroll */}
                <header 
                    className={`fixed top-0 w-full z-30 transition-all duration-300 ease-in-out ${
                        isHeaderSolid 
                            ? "bg-gradient-to-r from-[#1A237E]/95 to-[#283593]/95 shadow-md py-2" 
                            : "bg-transparent py-4"
                    } flex items-center justify-between px-4 sm:px-6 lg:px-8`}
                >
                    <div className="flex items-center">
                        <ApplicationLogo className={`transition-all duration-300 ${
                            isHeaderSolid ? "h-12 w-12 sm:h-14 sm:w-14" : "h-16 w-16 sm:h-20 sm:w-20"
                        } fill-current text-white`} />
                    </div>

                    {/* Sistema de navegación responsive */}
                    <nav className="relative">
                        {/* Navegación Desktop - Visible en md+ */}
                        <div className="hidden md:flex md:space-x-6 lg:space-x-8">
                            {auth.user ? (
                                <Link
                                    href={route("dashboard")}
                                    className="text-white text-base lg:text-lg hover:text-gray-300 transition-colors duration-200 relative group"
                                >
                                    Panel de Administración
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="text-white text-base lg:text-lg hover:text-gray-300 transition-colors duration-200 relative group"
                                    >
                                        Iniciar sesión
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="text-white text-base lg:text-lg hover:text-gray-300 transition-colors duration-200 relative group"
                                    >
                                        Registrarse
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Botón Menú Móvil - Visible en -md */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white hover:text-gray-300 focus:outline-none transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Menú Móvil Desplegable */}
                        <div
                            className={`${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                                } md:hidden absolute right-0 top-12 w-48 bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-lg shadow-lg 
                            transition-all duration-300 ease-in-out transform z-50 backdrop-blur-sm`}
                        >
                            <div className="py-2">
                                {auth.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="block px-4 py-2 text-white hover:bg-blue-800/50 transition-colors duration-200"
                                    >
                                        Panel de Administración
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="block px-4 py-2 text-white hover:bg-blue-800/50 transition-colors duration-200"
                                        >
                                            Iniciar sesión
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="block px-4 py-2 text-white hover:bg-blue-800/50 transition-colors duration-200"
                                        >
                                            Registrarse
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </header>

                <main className="flex-grow relative">
                    {/* Sección Hero con Video */}
                    <div className="relative min-h-screen flex items-center justify-center">
                        {/* Video de fondo con overlay */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                            {/* header image with improved styling */}
                            <img
                                src="/images/portadaClean.jpg"
                                alt="Hub de Innovación Social"
                                className="absolute inset-0 w-full h-full "
                                style={{
                                    objectPosition: "center 30%",
                                    filter: "brightness(0.7) contrast(1.1)"
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                }}
                            />
                            {/* Enhanced gradient overlay for better text visibility */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1A237E]/70 via-[#1A237E]/60 to-[#1A237E]/80"></div>
                            <div className="absolute inset-0 bg-[#000]/30"></div>
                            
                            {/* Subtle pattern overlay for texture */}
                            <div className="absolute inset-0 opacity-10" 
                                style={{
                                    backgroundImage: "url('/images/pattern.png')",
                                    backgroundRepeat: "repeat",
                                    mixBlendMode: "overlay"
                                }}>
                            </div>
                        </div>

                        {/* Contenido Hero Responsive */}
                        <div className="relative z-20 w-full p-4 mt-16 sm:mt-0">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    {/* Título Principal Responsive con animación */}
                                    <h1 className="
                                        font-montserrat 
                                        text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 
                                        font-extrabold 
                                        tracking-wide 
                                        text-white 
                                        leading-tight 
                                        mb-4 sm:mb-6 lg:mb-8
                                        transition-all duration-300
                                        max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[75vw]
                                        mx-auto
                                        animate-fade-in-up
                                    ">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                                            HUB de Innovación Social Startidea
                                        </span>
                                    </h1>

                                    {/* Descripción Principal Responsive */}
                                    <p className="
                                        mt-4
                                        text-sm sm:text-base md:text-lg lg:text-xl
                                        text-[#90CAF9]
                                        max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl
                                        leading-relaxed
                                        mx-auto
                                        px-4
                                        animate-fade-in-up animation-delay-200
                                    ">
                                        Nuestro espacio colaborativo reúne a personas, empresas y
                                        organizaciones para impulsar la creatividad, la innovación y
                                        el emprendimiento.
                                    </p>

                                    {/* Botones de acción */}
                                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-400">
                                        <a 
                                            href="#espacios" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('espacios').scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'start'
                                                });
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-[#1A237E] to-[#283593] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        >
                                            Ver espacios
                                        </a>
                                        <a 
                                            href="https://startidea.es/" 
                                            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                        >
                                            Conocer más
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Nueva Sección: Beneficios */}
                    <section className="py-16 sm:py-20 lg:py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 sm:mb-16">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-[#1A237E] rounded-full text-sm font-semibold mb-4">BENEFICIOS</span>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                                    Beneficios de nuestros espacios
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#90CAF9] mx-auto mb-6"></div>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                                    Descubre todas las ventajas que ofrecemos para potenciar tu trabajo y creatividad.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Beneficio 1 */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] group">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-blue-50 rounded-full group-hover:bg-[#1A237E]/10 transition-colors duration-300">
                                            <svg className="h-16 w-16 text-[#1A237E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Alta velocidad WiFi</h3>
                                    <p className="text-gray-600 text-center">
                                        Conexión de fibra óptica de alta velocidad para un trabajo sin interrupciones.
                                    </p>
                                </div>

                                {/* Beneficio 2 */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] group">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-blue-50 rounded-full group-hover:bg-[#1A237E]/10 transition-colors duration-300">
                                            <svg className="h-16 w-16 text-[#1A237E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Comunidad activa</h3>
                                    <p className="text-gray-600 text-center">
                                        Forma parte de nuestra vibrante comunidad de profesionales y emprendedores.
                                    </p>
                                </div>

                                {/* Beneficio 3 */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] group">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-blue-50 rounded-full group-hover:bg-[#1A237E]/10 transition-colors duration-300">
                                            <svg className="h-16 w-16 text-[#1A237E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Horario flexible</h3>
                                    <p className="text-gray-600 text-center">
                                        Accede a nuestros espacios cuando lo necesites con amplios horarios.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/*Seccion de Testimonios*/}
                    
                    <TestimonialsSection />

                    {/* Nueva Sección: Sobre Nosotros */}
                    <section className="py-16 sm:py-20 lg:py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                                <div className="w-full md:w-1/2 order-2 md:order-1">
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-[#1A237E] rounded-full text-sm font-semibold mb-4">SOBRE NOSOTROS</span>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-6">
                                        Sobre el HUB de Innovación Social
                                    </h2>
                                    <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#90CAF9] mb-6"></div>
                                    <p className="text-lg text-gray-600 mb-4">
                                        Somos un espacio colaborativo diseñado para impulsar la innovación social y el emprendimiento. Nuestra misión es crear un entorno donde las ideas puedan florecer y convertirse en proyectos de impacto.
                                    </p>
                                    <p className="text-lg text-gray-600 mb-6">
                                        Desde nuestra fundación en 2019, hemos acogido a más de 500 profesionales y 150 startups que han encontrado en nuestros espacios el lugar ideal para crecer y desarrollarse.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
                                            <svg className="h-6 w-6 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">Más de 1000m² de espacio</span>
                                        </div>
                                        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
                                            <svg className="h-6 w-6 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">Ubicación céntrica</span>
                                        </div>
                                        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
                                            <svg className="h-6 w-6 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">Equipamiento de última generación</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 order-1 md:order-2">
                                    <div className="relative">
                                        <div className="absolute -left-4 -top-4 w-24 h-24 bg-[#90CAF9] rounded-full opacity-20"></div>
                                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#1A237E] rounded-full opacity-20"></div>
                                        <div className="relative overflow-hidden rounded-xl shadow-xl">
                                            <img
                                                src="/images/portadaHub.jpg"
                                                alt="Espacio de coworking"
                                                className="w-full h-auto object-cover rounded-xl "
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección de Espacios Responsive */}
                    <section id="espacios" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 sm:mb-16">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-[#1A237E] rounded-full text-sm font-semibold mb-4">ESPACIOS</span>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                                    Nuestros Espacios
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#90CAF9] mx-auto mb-6"></div>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                                    Descubre los diferentes espacios que tenemos disponibles para
                                    ti. Cada uno diseñado para satisfacer tus necesidades
                                    profesionales.
                                </p>
                            </div>

                            {/* Grid Responsive de Espacios */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
                                {espacios?.length > 0 ? (
                                    espacios.map((espacio) => (
                                        <SpaceCard
                                            key={espacio.id}
                                            space={espacio}
                                            onOpenModal={openModal}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-1 sm:col-span-2 lg:col-span-2 text-center py-12">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <h3 className="mt-4 text-lg font-medium text-gray-900">No hay espacios disponibles</h3>
                                        <p className="mt-2 text-base text-gray-500">Estamos trabajando para añadir nuevos espacios pronto.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Nueva Sección: Preguntas Frecuentes */}
                    <FaqSection />

                    {/* Nueva Sección: Contacto */}
                    <ContactSection />

                    {/* Footer Component */}
                    <Footer />
                </main>
            </div>
        </>
    );
}