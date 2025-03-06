import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import BloqueosTable from "@/Components/BloqueosTable";
import ConfirmDeleteBloqueo from "@/Components/ConfirmDeleteBloqueo";

export default function BloqueosList({ bloqueos }) {
    const { auth, flash, errors } = usePage().props;
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedBloqueo, setSelectedBloqueo] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    // Manejo de mensajes flash y errores con toast - solo aquí, no en FlashMessage.jsx
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, { toastId: 'success-' + Date.now() });
        }
        
        if (errors.error) {
            toast.error(errors.error, { toastId: 'error-' + Date.now() });
        }
    }, [flash, errors]);

    // Función para manejar el cambio de filtro
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setSearch("");
        setStartDate("");
        setEndDate("");
    };

    // Función para manejar la eliminación
    const handleDelete = (bloqueo) => {
        setSelectedBloqueo(bloqueo);
        setShowConfirmDelete(true);
    };

    // Confirmar eliminación
    const confirmDelete = () => {
        const routePath = auth.user.role === 'superadmin' 
            ? `/v1/superadmin/bloqueos/${selectedBloqueo.id}`
            : `/v1/admin/bloqueos/${selectedBloqueo.id}`;
        
        router.delete(routePath, {
            onBefore: () => {
                toast.info("Procesando eliminación...", { 
                    autoClose: false, 
                    toastId: "deleting" 
                });
                return true;
            },
            onSuccess: () => {
                setShowConfirmDelete(false);
                setSelectedBloqueo(null);
                toast.dismiss("deleting");
                toast.success("Bloqueo eliminado correctamente", { 
                    toastId: 'delete-success-' + Date.now() 
                });
            },
            onError: (error) => {
                setShowConfirmDelete(false);
                toast.dismiss("deleting");
                toast.error(error.message || "Error al eliminar el bloqueo", { 
                    toastId: 'delete-error-' + Date.now() 
                });
            },
        });
    };

    // Cancelar la eliminación
    const cancelDelete = () => {
        setShowConfirmDelete(false);
        setSelectedBloqueo(null);
    };

    // Filtrar bloqueos según criterios seleccionados
    const filteredBloqueos = useMemo(() => {
        return bloqueos.filter((bloqueo) => {
            // Filtrado por texto en todos los campos
            if (filter === "all" && search) {
                const term = search.toLowerCase();
                return (bloqueo.espacio?.nombre?.toLowerCase().includes(term)) ||
                       (bloqueo.escritorio?.numero?.toString().toLowerCase().includes(term)) ||
                       bloqueo.motivo?.toLowerCase().includes(term) ||
                       (bloqueo.creadoPor?.name?.toLowerCase().includes(term));
            }
            
            // Filtrado por fechas
            if (filter === "date") {
                const bloqueoStart = new Date(bloqueo.fecha_inicio);
                const bloqueoEnd = new Date(bloqueo.fecha_fin);
                const filterStart = startDate ? new Date(startDate) : null;
                const filterEnd = endDate ? new Date(endDate) : null;

                return (!filterStart || bloqueoStart >= filterStart) &&
                       (!filterEnd || bloqueoEnd <= filterEnd);
            }
            
            return true;
        });
    }, [bloqueos, filter, search, startDate, endDate]);

    // Función para obtener el prefijo de ruta según el rol
    const getRoutePrefix = () => {
        return auth.user.role === 'superadmin' ? '/v1/superadmin' : '/v1/admin';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Bloqueos" />

            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-4xl font-bold mb-10 text-indigo-700 text-center mt-10">
                    Gestión de Bloqueos
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
                            <option value="all">Todos los campos</option>
                            <option value="date">Rango de Fecha</option>
                        </SelectInput>
                    </div>

                    {filter === "all" && (
                        <div className="flex items-center space-x-2">
                            <InputLabel htmlFor="search" value="Buscar:" />
                            <TextInput
                                id="search"
                                type="text"
                                placeholder="Buscar por espacio, escritorio, motivo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mt-1 block w-full"
                            />
                        </div>
                    )}

                    {filter === "date" && (
                        <>
                            <div className="flex items-center space-x-2">
                                <InputLabel htmlFor="startDate" value="Fecha Inicio:" />
                                <TextInput
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <InputLabel htmlFor="endDate" value="Fecha Fin:" />
                                <TextInput
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </>
                    )}

                    <div className="ml-auto">
                        <Link href={`${getRoutePrefix()}/bloqueos/create`}>
                            <PrimaryButton className="text-sm px-3 py-2">
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Crear Bloqueo
                                </span>
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>

                <BloqueosTable
                    bloqueos={filteredBloqueos}
                    onDelete={handleDelete}
                />

                {/* Usar el componente ConfirmDeleteBloqueo en lugar del Modal directamente */}
                {showConfirmDelete && selectedBloqueo && (
                    <ConfirmDeleteBloqueo
                        bloqueo={selectedBloqueo}
                        onConfirm={confirmDelete}
                        onCancel={cancelDelete}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}