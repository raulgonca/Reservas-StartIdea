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
                                    Dashboard
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
                            className={`${
                                isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                            } md:hidden absolute right-0 top-12 w-48 bg-gray-800 rounded-lg shadow-lg 
                            transition-all duration-300 ease-in-out transform z-50`}
                        >
                            <div className="py-2">
                                {auth.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Dashboard
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