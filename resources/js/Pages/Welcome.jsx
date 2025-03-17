import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import SpaceCard from "@/Components/SpaceCard";
import SpaceModal from "@/Components/SpaceModal";
import { useState } from "react";

/**
 * Componente principal Welcome que renderiza la página de inicio
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.auth - Información de autenticación del usuario
 * @param {string} props.laravelVersion - Versión actual de Laravel
 * @param {string} props.phpVersion - Versión actual de PHP
 * @param {Array} props.espacios - Lista de espacios disponibles
 */
export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    espacios = [],
}) {
    // Estados para control de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Manejadores de modal
    const openModal = (space) => {
        setSelectedSpace(space);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSpace(null);
    };

    return (
        <>
            <Head title="Reservas" />
            <SpaceModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                space={selectedSpace}
            />
            <div className="flex flex-col min-h-screen bg-gray-50 text-white">
                {/* Header Responsive */}
                <header className="bg-transparent absolute top-0 w-full z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <ApplicationLogo className="h-16 w-16 sm:h-20 sm:w-20 fill-current text-white" />
                    </div>

                    {/* Sistema de navegación responsive */}
                    <nav className="relative">
                        {/* Navegación Desktop - Visible en md+ */}
                        <div className="hidden md:flex md:space-x-6 lg:space-x-8">
                            {auth.user ? (
                                <Link
                                    href={route("dashboard")}
                                    className="text-white text-base lg:text-lg hover:text-gray-300 transition-colors duration-200"
                                >
                                    Panel de Administración
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="text-white text-base lg:text-lg hover:text-gray-300 transition-colors duration-200"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="text-white text-base lg:text-lg hover:text-gray-300 transition-colors duration-200"
                                    >
                                        Registrarse
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
                                } md:hidden absolute right-0 top-12 w-48 bg-gray-800 rounded-lg shadow-lg 
                            transition-all duration-300 ease-in-out transform z-50`}
                        >
                            <div className="py-2">
                                {auth.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Panel de Administración
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            Iniciar sesión
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200"
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
                        {/* Contenedor de Video */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                            <video
                                className="absolute w-full h-full object-cover object-center transform scale-105"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source
                                    src="/storage/videos/general/coworking1.mp4"
                                    type="video/mp4"
                                />
                            </video>
                        </div>

                        {/* Contenido Hero Responsive */}
                        <div className="relative z-20 w-full p-4 -mt-19">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    {/* Título Principal Responsive */}
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
                                    ">
                                        HUB de Innovación Social Startidea
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
                                    ">
                                        Nuestro espacio colaborativo reúne a personas, empresas y
                                        organizaciones para impulsar la creatividad, la innovación y
                                        el emprendimiento.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nueva Sección: Beneficios */}
                    <section className="py-16 sm:py-20 lg:py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 sm:mb-16">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                                    Beneficios de nuestros espacios
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                                    Descubre todas las ventajas que ofrecemos para potenciar tu trabajo y creatividad.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Beneficio 1 */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex justify-center mb-4">
                                        <svg className="h-16 w-16 text-[#1A237E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Alta velocidad WiFi</h3>
                                    <p className="text-gray-600 text-center">
                                        Conexión de fibra óptica de alta velocidad para un trabajo sin interrupciones.
                                    </p>
                                </div>

                                {/* Beneficio 2 */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex justify-center mb-4">
                                        <svg className="h-16 w-16 text-[#1A237E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Comunidad activa</h3>
                                    <p className="text-gray-600 text-center">
                                        Forma parte de nuestra vibrante comunidad de profesionales y emprendedores.
                                    </p>
                                </div>

                                {/* Beneficio 3 */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex justify-center mb-4">
                                        <svg className="h-16 w-16 text-[#1A237E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Horario flexible</h3>
                                    <p className="text-gray-600 text-center">
                                        Accede a nuestros espacios cuando lo necesites con amplios horarios.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Nueva Sección: Testimonios */}
                    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 sm:mb-16">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                                    Lo que dicen nuestros usuarios
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                                    Experiencias de personas que confían en nuestros espacios para desarrollar sus proyectos.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Testimonio 1 */}
                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <div className="flex items-center mb-4">
                                        <div className="h-12 w-12 rounded-full bg-[#90CAF9] flex items-center justify-center text-white font-bold text-xl">
                                            JD
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Juan Díaz</h4>
                                            <p className="text-gray-600">Diseñador UX</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 italic">
                                        "Las instalaciones son excelentes y el ambiente de trabajo realmente potencia mi creatividad. He podido conectar con otros profesionales y expandir mi red."
                                    </p>
                                    <div className="mt-3 flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonio 2 */}
                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <div className="flex items-center mb-4">
                                        <div className="h-12 w-12 rounded-full bg-[#90CAF9] flex items-center justify-center text-white font-bold text-xl">
                                            MR
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold text-gray-900">María Rodríguez</h4>
                                            <p className="text-gray-600">Desarrolladora Full Stack</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 italic">
                                        "Desde que trabajo en este coworking mi productividad ha aumentado considerablemente. Los espacios están pensados para favorecer la concentración."
                                    </p>
                                    <div className="mt-3 flex">
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

                    {/* Nueva Sección: Sobre Nosotros */}
                    <section className="py-16 sm:py-20 lg:py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                                <div className="w-full md:w-1/2 order-2 md:order-1">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-6">
                                        Sobre el HUB de Innovación Social
                                    </h2>
                                    <p className="text-lg text-gray-600 mb-4">
                                        Somos un espacio colaborativo diseñado para impulsar la innovación social y el emprendimiento. Nuestra misión es crear un entorno donde las ideas puedan florecer y convertirse en proyectos de impacto.
                                    </p>
                                    <p className="text-lg text-gray-600 mb-6">
                                        Desde nuestra fundación en 2019, hemos acogido a más de 500 profesionales y 150 startups que han encontrado en nuestros espacios el lugar ideal para crecer y desarrollarse.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <svg className="h-6 w-6 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">Más de 1000m² de espacio</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="h-6 w-6 text-[#1A237E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">Ubicación céntrica</span>
                                        </div>
                                        <div className="flex items-center">
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
                                                src="/storage/images/coworking-about.jpg"
                                                alt="Espacio de coworking"
                                                className="w-full h-auto object-cover rounded-xl"
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
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                                    Nuestros Espacios
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                                    Descubre los diferentes espacios que tenemos disponibles para
                                    ti. Cada uno diseñado para satisfacer tus necesidades
                                    profesionales.
                                </p>
                            </div>

                            {/* Grid Responsive de Espacios */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
                                {espacios?.map((espacio) => (
                                    <SpaceCard
                                        key={espacio.id}
                                        space={espacio}
                                        onOpenModal={openModal}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>


                    {/* Footer Responsive */}
                    <footer className="bg-[#1A237E] text-white">
                        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                            <div className="text-center text-xs sm:text-sm">
                                <p>
                                    © {new Date().getFullYear()} HUB de Innovación Social
                                    Startidea - Laravel v{laravelVersion} (PHP v{phpVersion})
                                </p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}