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

export default function ReservasList() {
    const { reservas, users, espacios, escritorios } = usePage().props;
    const [filter, setFilter] = useState("user");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("");
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setSearch("");
        setStartDate("");
        setEndDate("");
        setStatus("");
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleEdit = (reserva) => {
        setSelectedReserva(reserva);
        setShowModal(true);
    };

    const handleDelete = (reserva) => {
        setSelectedReserva(reserva);
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        router.delete(route("superadmin.reservas.destroy", selectedReserva.id), {
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

    const filteredReservas = reservas.filter((reserva) => {
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
        <AuthenticatedLayout>
            <Head title="Listado de Reservas" />
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-4xl font-bold mb-10 text-indigo-700 text-center mt-10">
                    Listado de Reservas
                </h1>
                <div className="mb-10 mt-10 flex flex-wrap justify-around gap-4">
                    <div className="flex items-center space-x-2">
                        <InputLabel htmlFor="filter" value="Filtrar por:" />
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

                    {(filter === "user" || filter === "espacio") && (
                        <div className="flex items-center space-x-2">
                            <InputLabel htmlFor="search" value="Buscar:" />
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

                    {filter === "fecha" && (
                        <>
                            <div className="flex items-center space-x-2">
                                <InputLabel htmlFor="startDate" value="Fecha Inicio:" />
                                <TextInput
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <InputLabel htmlFor="endDate" value="Fecha Fin:" />
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

                    {filter === "estado" && (
                        <div className="flex items-center space-x-2">
                            <InputLabel htmlFor="status" value="Estado:" />
                            <SelectInput
                                id="status"
                                value={status}
                                onChange={handleStatusChange}
                                className="mt-1 block w-full"
                            >
                                <option value="">Seleccione un estado</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="cancelada">Cancelada</option>
                            </SelectInput>
                        </div>
                    )}
                </div>

                <ReservasTable
                    reservas={filteredReservas}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {showModal && (
                    <ReservaModal
                        reserva={selectedReserva}
                        onClose={() => setShowModal(false)}
                        users={users}
                        espacios={espacios}
                        escritorios={escritorios}
                    />
                )}

                {showConfirmDelete && (
                    <ConfirmDelete
                        reserva={selectedReserva}
                        onConfirm={confirmDelete}
                        onCancel={() => setShowConfirmDelete(false)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}