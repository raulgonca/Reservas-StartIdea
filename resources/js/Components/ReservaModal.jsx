import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TextareaInput from "@/Components/TextareaInput";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import HourSelectInput from "@/Components/HourSelectInput";
import { format, addDays, addMonths } from "date-fns";

export default function ReservaModal({
  reserva,
  onClose,
  onSave,
  users = [],
  espacios = [],
  escritorios = [],
}) {
  const [data, setData] = useState({
    user_id: reserva.user_id,
    espacio_id: reserva.espacio_id,
    escritorio_id: reserva.escritorio_id,
    fecha_inicio: reserva.fecha_inicio.split("T")[0],
    fecha_fin: reserva.fecha_fin.split("T")[0],
    hora_inicio: reserva.hora_inicio,
    hora_fin: reserva.hora_fin,
    tipo_reserva: reserva.tipo_reserva,
    motivo: reserva.motivo,
  });

  const [showEscritorio, setShowEscritorio] = useState(false);
  const [escritoriosLibres, setEscritoriosLibres] = useState([]);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [tempEscritorioId, setTempEscritorioId] = useState(data.escritorio_id);

  useEffect(() => {
    const selectedEspacio = espacios.find(
      (espacio) => espacio.id === Number(data.espacio_id)
    );
    setShowEscritorio(selectedEspacio?.tipo === "coworking");

    if (selectedEspacio?.tipo === "coworking") {
      const libres = escritorios.filter(
        (escritorio) =>
          escritorio.espacio_id === Number(data.espacio_id) &&
          escritorio.disponible
      );
      setEscritoriosLibres(libres);
    } else {
      setTempEscritorioId("");
    }
  }, [data.espacio_id, escritorios, espacios]);

  useEffect(() => {
    if (tempEscritorioId !== data.escritorio_id) {
      setData((prevData) => ({ ...prevData, escritorio_id: tempEscritorioId }));
    }
  }, [tempEscritorioId]);

  // Efecto para calcular fecha_fin según el tipo de reserva
  useEffect(() => {
    if (data.fecha_inicio) {
      let fechaFin;
      switch (data.tipo_reserva) {
        case "semana":
          fechaFin = format(
            addDays(new Date(data.fecha_inicio), 7),
            "yyyy-MM-dd"
          );
          break;
        case "mes":
          fechaFin = format(
            addMonths(new Date(data.fecha_inicio), 1),
            "yyyy-MM-dd"
          );
          break;
        case "hora":
        case "medio_dia":
        case "dia_completo":
          fechaFin = data.fecha_inicio;
          break;
        default:
          break;
      }
      setData((prevData) => ({
        ...prevData,
        fecha_fin: fechaFin || prevData.fecha_fin,
      }));
    }
  }, [data.tipo_reserva, data.fecha_inicio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await post(route("superadmin.reservas.update", reserva.id), data);
      toast.success("Reserva actualizada correctamente");
      onSave();
    } catch (error) {
      setErrors(error.response.data.errors);
      toast.error("Error al actualizar la reserva");
    } finally {
      setProcessing(false);
    }
  };

  // Renderizar inputs de fecha y hora
  const renderFechaYHora = () => {
    return (
      <>
        <div className="mb-4">
          <InputLabel htmlFor="fecha_inicio" value="Fecha" />
          <TextInput
            type="date"
            name="fecha_inicio"
            value={data.fecha_inicio}
            className="mt-1 block w-full"
            autoComplete="off"
            min={today}
            onChange={handleChange}
          />
          <InputError message={errors.fecha_inicio} className="mt-2" />
        </div>
        {["hora", "medio_dia", "dia_completo"].includes(data.tipo_reserva) && (
          <>
            <div className="mb-4">
              <InputLabel htmlFor="hora_inicio" value="Hora Inicio" />
              <HourSelectInput
                name="hora_inicio"
                value={data.hora_inicio}
                onChange={handleChange}
              />
              <InputError message={errors.hora_inicio} className="mt-2" />
            </div>
            <div className="mb-4">
              <InputLabel htmlFor="hora_fin" value="Hora Fin" />
              <HourSelectInput
                name="hora_fin"
                value={data.hora_fin}
                onChange={handleChange}
              />
              <InputError message={errors.hora_fin} className="mt-2" />
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <Modal show={true} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="mb-4">
          <InputLabel htmlFor="usuario" value="Usuario" />
          <p id="usuario" className="mt-1 block w-full bg-gray-100 p-2 rounded">
            {reserva.user.name}
          </p>
        </div>
        <div className="mb-4">
          <InputLabel htmlFor="espacio_id" value="Espacio" />
          <SelectInput
            name="espacio_id"
            value={data.espacio_id}
            onChange={handleChange}
            className="mt-1 block w-full"
          >
            <option value="" disabled hidden>
              Seleccione un espacio
            </option>
            {espacios.map((espacio) => (
              <option key={espacio.id} value={espacio.id}>
                {espacio.nombre}
              </option>
            ))}
          </SelectInput>
          <InputError message={errors.espacio_id} className="mt-2" />
        </div>
        {showEscritorio && (
          <div className="mb-4">
            <InputLabel htmlFor="escritorio_id" value="Escritorio" />
            <SelectInput
              name="escritorio_id"
              value={data.escritorio_id}
              onChange={handleChange}
              className="mt-1 block w-full"
            >
              <option value="" disabled hidden>
                Seleccione un escritorio
              </option>
              {escritoriosLibres.map((escritorio) => (
                <option key={escritorio.id} value={escritorio.id}>
                  {escritorio.nombre}
                </option>
              ))}
            </SelectInput>
            <InputError message={errors.escritorio_id} className="mt-2" />
          </div>
        )}
        <div className="mb-4">
          <InputLabel htmlFor="tipo_reserva" value="Tipo de Reserva" />
          <SelectInput
            name="tipo_reserva"
            value={data.tipo_reserva}
            onChange={handleChange}
            className="mt-1 block w-full"
          >
            <option value="hora">Hora</option>
            <option value="medio_dia">Medio Día</option>
            <option value="dia_completo">Día Completo</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </SelectInput>
          <InputError message={errors.tipo_reserva} className="mt-2" />
        </div>
        {renderFechaYHora()}
        <div className="mb-4">
          <InputLabel htmlFor="motivo" value="Motivo" />
          <TextareaInput
            name="motivo"
            value={data.motivo}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          <InputError message={errors.motivo} className="mt-2" />
        </div>
        <div className="mt-6 flex justify-between">
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white"
            disabled={processing}
          >
            Guardar Cambios
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
