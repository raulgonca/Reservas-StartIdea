/**
 * Componente para mostrar y filtrar las reservas de un usuario
 * Incluye paginación y filtros por fecha y estado
 */
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Pagination from "@/Components/Pagination"; // Importamos el componente de paginación

export default function ReservasUser() {
  const { reservas, auth } = usePage().props;
  
  // Extraer datos y metadatos de paginación de forma segura
  const reservasData = reservas?.data || [];
  const reservasPagination = {
    total: reservas?.total || 0,
    from: reservas?.from || 0,
    to: reservas?.to || 0,
    links: reservas?.links || []
  };
  
  // Estados para los filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Manejadores de eventos para los filtros
   */
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleStatusChange = (e) => setStatus(e.target.value);

  /**
   * Filtrar reservas según los criterios seleccionados
   * Trabaja con el array de datos extraído del objeto de paginación
   */
  const filteredReservas = reservasData.filter((reserva) => {
    let matches = true;

    // Filtro por fecha de inicio
    if (startDate) {
      matches = matches && new Date(reserva.fecha_inicio) >= new Date(startDate);
    }
    
    // Filtro por fecha de fin
    if (endDate) {
      matches = matches && new Date(reserva.fecha_fin) <= new Date(endDate);
    }
    
    // Filtro por estado
    if (status) {
      matches = matches && reserva.estado === status;
    }

    return matches;
  });

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Mis Reservas" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <h1 className="text-4xl text-center text-teal-500 mt-10 mb-10">Mis reservas</h1>
          
          {/* Lista de Reservas */}
          <div className="overflow-x-auto mt-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Espacio
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Escritorio
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha Inicio
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hora Inicio
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha Fin
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hora Fin
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {filteredReservas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-6 px-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  filteredReservas.map((reserva) => (
                    <tr
                      key={reserva.id}
                      className="border-b last:border-none dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {reserva.espacio?.nombre}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {reserva.espacio?.tipo === "coworking"
                          ? reserva.escritorio?.nombre || "Sin asignar"
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {format(new Date(reserva.fecha_inicio), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {format(new Date(reserva.fecha_inicio), "HH:mm")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {format(new Date(reserva.fecha_fin), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {format(new Date(reserva.fecha_fin), "HH:mm")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${
                                  reserva.estado === "confirmada"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : reserva.estado === "pendiente"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                        >
                          {reserva.estado.charAt(0).toUpperCase() +
                            reserva.estado.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Resumen de resultados y paginación */}
          {reservasData.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
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
    </AuthenticatedLayout>
  );
}