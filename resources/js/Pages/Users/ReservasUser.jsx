import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ReservasUser() {
  const { reservas } = usePage().props;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleStatusChange = (e) => setStatus(e.target.value);

  const filteredReservas = reservas.filter((reserva) => {
    let matches = true;

    if (startDate) {
      matches =
        matches && new Date(reserva.fecha_inicio) >= new Date(startDate);
    }
    if (endDate) {
      matches = matches && new Date(reserva.fecha_fin) <= new Date(endDate);
    }
    if (status) {
      matches = matches && reserva.estado === status;
    }

    return matches;
  });

  return (
    <AuthenticatedLayout>
      

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <h1 className="text-4xl text-center text-teal-500 mt-10 mb-10">Mis reservas</h1>
          {/* Lista de Reservas */}
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
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
                                    ? "text-green-600"
                                    : reserva.estado === "pendiente"
                                    ? "text-yellow-600"
                                    : "text-red-600"
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
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
