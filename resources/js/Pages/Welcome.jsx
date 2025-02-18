import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import SpaceCard from "@/Components/SpaceCard";
import SpaceModal from "@/Components/SpaceModal";
import { useState } from "react";

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    espacios = [],
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);

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
                <header className="bg-gray-800 w-full flex items-center justify-between px-6">
                    <div className="flex items-center">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </div>
                    <nav className="flex space-x-4">
                        {auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="text-white hover:text-gray-300"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="text-white hover:text-gray-300"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="text-white hover:text-gray-300"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex-grow relative">
                    {/* Hero Section con video de fondo */}
                    <div className="relative min-h-screen flex items-center justify-center">
                        {/* Video de fondo */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                            {/* Capa de overlay con el color corporativo */}
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

                        {/* Contenido superpuesto */}
                        <div className="relative z-20 w-full p-4">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    {/* Título principal con mejor escalado de texto */}
                                    <h1
                                        className="font-montserrat text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-9xl 
                         font-extrabold tracking-wider text-white leading-tight mb-4 sm:mb-6 lg:mb-8
                         transition-all duration-300"
                                    >
                                        HUB de Innovación Social Startidea
                                    </h1>

                                    {/* Descripción con mejor adaptación y legibilidad */}
                                    <p
                                        className="mt-4 sm:mt-6 lg:mt-8 
                         mx-auto 
                         text-sm sm:text-base md:text-lg lg:text-xl
                         text-[#90CAF9] 
                         max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl
                         leading-relaxed
                         px-4"
                                    >
                                        Tu espacio de coworking en el corazón de la ciudad. Espacios
                                        flexibles diseñados para impulsar tu creatividad y
                                        productividad.
                                    </p>

                                    {/* Logo con tamaño adaptativo */}
                                    <div className="mt-8 sm:mt-10 lg:mt-12">
                                        <ApplicationLogo className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

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
            </div>
        </>
    );
}
