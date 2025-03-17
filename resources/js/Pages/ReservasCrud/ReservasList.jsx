/**
 * Componente de listado y gestión de reservas
 * Permite ver, filtrar, editar y eliminar reservas
 */
import React, { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ReservaModal from "@/Components/ReservaModal";
import ConfirmDelete from "@/Components/ConfirmDelete";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import ReservasTable from "@/Components/ReservasTable";
import Pagination from "@/Components/Pagination"; // Importamos el componente de paginación

/**
 * Vista principal de gestión de reservas
 * @returns {JSX.Element} Componente ReservasList
 */
export default function ReservasList() {
    // Obtenemos los datos enviados desde el controlador
    const { reservas, users, espacios, escritorios, auth } = usePage().props;
    
    // Procesamiento de datos para paginación
    const reservasData = reservas?.data || reservas || [];
    const reservasPagination = {
        total: reservas?.total || 0,
        from: reservas?.from || 0,
        to: reservas?.to || 0,
        links: reservas?.links || []
    };

    // Estados para filtros y búsqueda
    const [filter, setFilter] = useState("user");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("");
    
    // Estados para modales
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    /**
     * Maneja el cambio en el tipo de filtro
     * @param {Object} e - Evento de cambio
     */
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setSearch("");
        setStartDate("");
        setEndDate("");
        setStatus("");
    };

    /**
     * Maneja el cambio en el campo de búsqueda
     * @param {Object} e - Evento de cambio
     */
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    /**
     * Maneja el cambio en la fecha de inicio
     * @param {Object} e - Evento de cambio
     */
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    /**
     * Maneja el cambio en la fecha de fin
     * @param {Object} e - Evento de cambio
     */
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    /**
     * Maneja el cambio en el filtro de estado
     * @param {Object} e - Evento de cambio
     */
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    /**
     * Establece la reserva seleccionada y muestra el modal de edición
     * @param {Object} reserva - Reserva a editar
     */
    const handleEdit = (reserva) => {
        setSelectedReserva(reserva);
        setShowModal(true);
    };

    /**
     * Establece la reserva seleccionada y muestra el modal de confirmación de eliminación
     * @param {Object} reserva - Reserva a eliminar
     */
    const handleDelete = (reserva) => {
        setSelectedReserva(reserva);
        setShowConfirmDelete(true);
    };

    /**
     * Elimina la reserva del servidor y actualiza la UI
     */
    const confirmDelete = () => {
        // Determinar la ruta según el rol del usuario
        const routePrefix = auth.user.role === 'superadmin' ? 'superadmin' : 'admin';
        
        router.delete(route(`${routePrefix}.reservas.destroy`, selectedReserva.id), {
            onSuccess: () => {
                toast.success("Reserva eliminada correctamente");
                setShowConfirmDelete(false);
                setSelectedReserva(null);
            },
            onError: (error) => {
                toast.error(error.message || "Error al eliminar la reserva");
            },
        });
    };

    /**
     * Efecto para escuchar el evento de actualización de reserva
     */
    useEffect(() => {
        const handleReservaUpdate = () => {
            setShowModal(false);
            setSelectedReserva(null);
            router.reload();
        };

        document.addEventListener('reservaUpdated', handleReservaUpdate);
        return () => {
            document.removeEventListener('reservaUpdated', handleReservaUpdate);
        };
    }, []);

    /**
     * Filtra las reservas según los criterios seleccionados
     */
    const filteredReservas = reservasData.filter((reserva) => {
        if (filter === "user" && search) {
            return reserva.user.name.toLowerCase().includes(search.toLowerCase());
        }
        if (filter === "espacio" && search) {
            return reserva.espacio.nombre.toLowerCase().includes(search.toLowerCase());
        }
        if (filter === "fecha") {
            const reservaStart = new Date(reserva.fecha_inicio);
            const reservaEnd = new Date(reserva.fecha_fin);
            const filterStart = startDate ? new Date(startDate) : null;
            const filterEnd = endDate ? new Date(endDate) : null;

            return (!filterStart || reservaStart >= filterStart) &&
                   (!filterEnd || reservaEnd <= filterEnd);
        }
        if (filter === "estado" && status) {
            return reserva.estado === status;
        }
        return true;
    });

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Listado de Reservas" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Encabezado de la página */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Gestión de Reservas
                                </h2>
                            </div>
                            
                            {/* Panel de filtros */}
                            <div className="mb-6 flex flex-col md:flex-row gap-4">
                                {/* Selector de tipo de filtro */}
                                <div className="w-full md:w-1/4">
                                    <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Filtrar por
                                    </label>
                                    <SelectInput
                                        id="filter"
                                        value={filter}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full"
                                    >
                                        <option value="user">Usuario</option>
                                        <option value="espacio">Espacio</option>
                                        <option value="fecha">Rango de Fecha</option>
                                        <option value="estado">Estado</option>
                                    </SelectInput>
                                </div>

                                {/* Filtro por usuario o espacio */}
                                {(filter === "user" || filter === "espacio") && (
                                    <div className="w-full md:w-3/4">
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Buscar
                                        </label>
                                        <TextInput
                                            id="search"
                                            type="text"
                                            placeholder={`Buscar por ${filter === "user" ? "nombre de usuario" : "nombre de espacio"}...`}
                                            value={search}
                                            onChange={handleSearchChange}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                )}

                                {/* Filtro por rango de fechas */}
                                {filter === "fecha" && (
                                    <>
                                        <div className="w-full md:w-2/5">
                                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Fecha Inicio
                                            </label>
                                            <TextInput
                                                id="startDate"
                                                type="date"
                                                value={startDate}
                                                onChange={handleStartDateChange}
                                                className="mt-1 block w-full"
                                            />
                                        </div>
                                        <div className="w-full md:w-2/5">
                                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Fecha Fin
                                            </label>
                                            <TextInput
                                                id="endDate"
                                                type="date"
                                                value={endDate}
                                                onChange={handleEndDateChange}
                                                className="mt-1 block w-full"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Filtro por estado */}
                                {filter === "estado" && (
                                    <div className="w-full md:w-3/4">
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Estado
                                        </label>
                                        <SelectInput
                                            id="status"
                                            value={status}
                                            onChange={handleStatusChange}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="confirmada">Confirmada</option>
                                            <option value="pendiente">Pendiente</option>
                                            <option value="cancelada">Cancelada</option>
                                        </SelectInput>
                                    </div>
                                )}
                            </div>

                            {/* Tabla de reservas */}
                            <div className="overflow-x-auto">
                                <ReservasTable
                                    reservas={filteredReservas}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                            
                            {/* Resumen de resultados y paginación */}
                            {reservasData.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Mostrando {reservasPagination.from || 1} - {reservasPagination.to || reservasData.length} de {reservasPagination.total || reservasData.length} reservas
                                    </div>
                                    
                                    {/* Paginación centrada */}
                                    {reservasPagination.links && reservasPagination.links.length > 3 && (
                                        <div className="mt-4 flex justify-center">
                                            <Pagination links={reservasPagination.links} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para editar reserva */}
            {showModal && (
                <ReservaModal
                    reserva={selectedReserva}
                    onClose={() => setShowModal(false)}
                    users={users}
                    espacios={espacios}
                    escritorios={escritorios}
                />
            )}

            {/* Modal de confirmación para eliminar reserva */}
            {showConfirmDelete && (
                <ConfirmDelete
                    reserva={selectedReserva}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowConfirmDelete(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}