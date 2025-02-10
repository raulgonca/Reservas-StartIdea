import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ReservaModal({ reserva, onClose, onSave, reservas }) {
    const [espacioId, setEspacioId] = useState(reserva.espacio_id);
    const [escritorioId, setEscritorioId] = useState(reserva.escritorio_id);
    const [fechaInicio, setFechaInicio] = useState(reserva.fecha_inicio);
    const [horaInicio, setHoraInicio] = useState(reserva.hora_inicio);
    const [fechaFin, setFechaFin] = useState(reserva.fecha_fin);
    const [horaFin, setHoraFin] = useState(reserva.hora_fin);
    const [tipoReserva, setTipoReserva] = useState(reserva.tipo_reserva);
    const [motivo, setMotivo] = useState(reserva.motivo);

    const handleSave = () => {
        // Verificar que la reserva no se solape con otras reservas
        const solapamiento = reservas.some((r) => {
            if (r.id === reserva.id) return false; // Ignorar la reserva actual
            const inicio = new Date(fechaInicio + 'T' + horaInicio);
            const fin = new Date(fechaFin + 'T' + horaFin);
            const rInicio = new Date(r.fecha_inicio);
            const rFin = new Date(r.fecha_fin);
            return (inicio < rFin && fin > rInicio);
        });

        if (solapamiento) {
            toast.error('La reserva se solapa con otra reserva existente.');
            return;
        }

        // Si no hay solapamientos, guardar la reserva
        onSave({
            ...reserva,
            espacio_id: espacioId,
            escritorio_id: escritorioId,
            fecha_inicio: fechaInicio,
            hora_inicio: horaInicio,
            fecha_fin: fechaFin,
            hora_fin: horaFin,
            tipo_reserva: tipoReserva,
            motivo: motivo,
        });
    };

    return (
        <Modal show={true} onClose={onClose}>
            <div className="p-6 max-w-lg mx-auto max-h-screen overflow-y-auto mt-4 mb-4">
                <h2 className="text-xl font-bold mb-4 text-center">Editar Reserva</h2>
                <div className="mb-4">
                    <InputLabel htmlFor="usuario" value="Usuario" />
                    <p id="usuario" className="mt-1 block w-full bg-gray-100 p-2 rounded">{reserva.user.name}</p>
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="espacio" value="Espacio" />
                    <SelectInput id="espacio" value={espacioId} onChange={(e) => setEspacioId(e.target.value)} className="mt-1 block w-full">
                        {/* Aquí deberías cargar los espacios disponibles */}
                    </SelectInput>
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="escritorio" value="Escritorio" />
                    <SelectInput id="escritorio" value={escritorioId} onChange={(e) => setEscritorioId(e.target.value)} className="mt-1 block w-full">
                        {/* Aquí deberías cargar los escritorios disponibles */}
                    </SelectInput>
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="fechaInicio" value="Fecha Inicio" />
                    <TextInput id="fechaInicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="mt-1 block w-full" />
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="horaInicio" value="Hora Inicio" />
                    <TextInput id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="mt-1 block w-full" />
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="fechaFin" value="Fecha Fin" />
                    <TextInput id="fechaFin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1 block w-full" />
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="horaFin" value="Hora Fin" />
                    <TextInput id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="mt-1 block w-full" />
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="tipoReserva" value="Tipo de Reserva" />
                    <SelectInput id="tipoReserva" value={tipoReserva} onChange={(e) => setTipoReserva(e.target.value)} className="mt-1 block w-full">
                        <option value="hora">Hora</option>
                        <option value="medio_dia">Medio Día</option>
                        <option value="dia_completo">Día Completo</option>
                        <option value="semana">Semana</option>
                        <option value="mes">Mes</option>
                    </SelectInput>
                </div>
                <div className="mb-4">
                    <InputLabel htmlFor="motivo" value="Motivo" />
                    <TextInput id="motivo" type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 block w-full" />
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                    <PrimaryButton onClick={onClose} className="mr-2">Cancelar</PrimaryButton>
                    <PrimaryButton onClick={handleSave}>Guardar</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}