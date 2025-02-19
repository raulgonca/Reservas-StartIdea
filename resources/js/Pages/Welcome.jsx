import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import SpaceCard from "@/Components/SpaceCard";
import SpaceModal from "@/Components/SpaceModal";
import { useState } from "react";
import {
    CheckCircleIcon,
    CalendarIcon,
    UserCircleIcon,
    UsersIcon,
    CheckIcon,
    ClockIcon,
    CogIcon,
    BellIcon,
    LifebuoyIcon
} from "@heroicons/react/24/outline";

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    espacios = [],
}) {
    // Estados para el manejo de modales y menú
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Funciones para manejar el modal
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
                {/* Header y Navegación */}
                <header className="bg-gray-800 w-full flex items-center justify-between px-6">
                    <div className="flex items-center">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </div>

                    <nav className="relative">
                        {/* Menú Desktop */}
                        <div className="hidden md:flex md:space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route("dashboard")}
                                    className="text-white text-sm md:text-base hover:text-gray-300 transition-colors duration-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="text-white text-sm md:text-base hover:text-gray-300 transition-colors duration-200"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="text-white text-sm md:text-base hover:text-gray-300 transition-colors duration-200"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Botón Hamburguesa */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white hover:text-gray-300 focus:outline-none"
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

                        {/* Menú Móvil */}
                        <div
                            className={`${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                                } md:hidden absolute right-0 top-10 w-48 bg-gray-800 rounded-lg shadow-lg 
                            transition-all duration-200 ease-in-out transform z-50`}
                        >
                            <div className="py-2 space-y-2">
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
                    {/* Hero Section con video de fondo */}
                    <div className="relative min-h-screen flex items-center justify-center">
                        {/* Video de fondo */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                            {/* Capa de overlay */}
                            <div className="absolute inset-0 bg-[#000000] opacity-60 z-10"></div>
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

                        {/* Contenido Hero */}
                        <div className="relative z-20 w-full p-4">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    {/* Título principal */}
                                    <h1 className="font-montserrat 
                                        text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl
                                        font-extrabold tracking-wide text-white 
                                        leading-tight 
                                        mb-6 sm:mb-8 lg:mb-10
                                        transition-all duration-300
                                        overflow-hidden text-wrap
                                        max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw]
                                        mx-auto
                                        break-words">
                                        HUB de Innovación Social Startidea
                                    </h1>

                                    {/* Descripción principal */}

                                    <p className="mt-4 
                                        mx-auto 
                                        text-sm sm:text-base md:text-lg lg:text-xl
                                        text-[#90CAF9] 
                                        max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl
                                        leading-relaxed
                                        px-4">
                                        Nuestro espacio colaborativo reúne a personas, empresas y
                                        organizaciones para impulsar la creatividad, la innovación
                                        y el emprendimiento.
                                    </p>

                                    {/* Logo */}
                                    <div className="mt-8 sm:mt-10 lg:mt-12">
                                        <ApplicationLogo className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección ¿Qué es HUB de Innovación? */}
                    <section className="py-20 bg-white dark:bg-gray-900">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 
              bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">
                                    Transforma tu forma de trabajar
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
                                    Gestiona tus reservas de espacios inteligentes y conecta con una comunidad innovadora
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700
          transform transition-all duration-300 hover:shadow-xl">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                            Tu espacio para innovar 🚀
                                        </h3>
                                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                            En nuestro Hub, no solo reservas espacios - creas oportunidades. Disfruta de:
                                        </p>
                                        <ul className="space-y-4 mb-8">
                                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                                                Reservas instantáneas de espacios colaborativos
                                            </li>
                                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                                                Gestión de perfil personalizada
                                            </li>
                                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                                                Acceso a eventos exclusivos
                                            </li>
                                        </ul>
                                       
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección Pilares */}
                    <section className="py-20 bg-gray-50 dark:bg-gray-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                    Nuestra esencia digital
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-gray-300">
                                    Funcionalidades diseñadas para tu comodidad y productividad
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        title: "Reservas",
                                        icon: CalendarIcon,
                                        color: "bg-blue-100 dark:bg-blue-900",
                                        text: "Sistema de reservas en tiempo real con disponibilidad instantánea",
                                        features: [ "Notificaciones inteligentes", "Historial de reservas"]
                                    },
                                    {
                                        title: "Gestión Personal",
                                        icon: UserCircleIcon,
                                        color: "bg-purple-100 dark:bg-purple-900",
                                        text: "Perfil personalizado con tus preferencias y historial",
                                        features: ["Actualización en 1 clic",  "Acceso rápido"]
                                    },
                                    {
                                        title: "Comunidad Activa",
                                        icon: UsersIcon,
                                        color: "bg-green-100 dark:bg-green-900",
                                        text: "Conecta con otros innovadores y colabora",
                                        features: ["Eventos exclusivos", "Red de contactos"]
                                    }
                                ].map((pilar, index) => (
                                    <div key={index} className={`group p-8 rounded-2xl ${pilar.color} 
                  transition-all duration-300 hover:transform hover:-translate-y-2`}>
                                        <div className="mb-6">
                                            <pilar.icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                            {pilar.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                                            {pilar.text}
                                        </p>
                                        <ul className="space-y-3">
                                            {pilar.features.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Sección Objetivos */}
                    <section className="py-20 bg-white dark:bg-gray-900">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                    Tu experiencia, nuestra prioridad
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-gray-300">
                                    Diseñado para simplificar tu proceso creativo
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    {
                                        title: "Reserva en 3 pasos",
                                        icon: ClockIcon,
                                        text: "1. Selecciona espacio - 2. Elige horario - 3. Confirma reserva",
                                        color: "text-blue-600"
                                    },
                                    {
                                        title: "Perfil personalizado",
                                        icon: CogIcon,
                                        text: "Guarda tus configuraciones favoritas para reservas recurrentes",
                                        color: "text-purple-600"
                                    },
                                    {
                                        title: "Notificaciones inteligentes",
                                        icon: BellIcon,
                                        text: "Recuerdos automáticos y actualizaciones de disponibilidad",
                                        color: "text-green-600"
                                    },
                                    {
                                        title: "Soporte 24/7",
                                        icon: LifebuoyIcon,
                                        text: "Asistencia inmediata para cualquier necesidad",
                                        color: "text-orange-600"
                                    }
                                ].map((objetivo, index) => (
                                    <div key={index} className="group bg-white dark:bg-gray-800 p-8 rounded-xl 
                  shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className={`mb-4 ${objetivo.color}`}>
                                            <objetivo.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {objetivo.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {objetivo.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Sección de Espacios */}
                    <section id="espacios" className="py-24 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-4">
                                    Nuestros Espacios
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Descubre los diferentes espacios que tenemos disponibles para
                                    ti. Cada uno diseñado para satisfacer tus necesidades
                                    profesionales.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {espacios &&
                                    espacios.map((espacio) => (
                                        <SpaceCard
                                            key={espacio.id}
                                            space={espacio}
                                            onOpenModal={openModal}
                                        />
                                    ))}
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="bg-[#1A237E] text-white">
                        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                            <div className="text-center text-sm">
                                <p>
                                    © {new Date().getFullYear()} HUB de Innovación Social Startidea
                                    - Laravel v{laravelVersion} (PHP v{phpVersion})
                                </p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}