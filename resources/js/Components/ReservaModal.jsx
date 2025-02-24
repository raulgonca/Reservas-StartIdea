import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TextareaInput from "@/Components/TextareaInput";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import HourSelectInput from "@/Components/HourSelectInput";
import axios from 'axios';

export default function ReservaModal({
    reserva,
    onClose,
    users,
    espacios,
    escritorios
}) {

    // Función para formatear hora desde string de fecha
    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'UTC'  // Asegura consistencia en la zona horaria
            });
        } catch (e) {
            return '';
        }
    };

    // Inicialización del formulario con useForm
    const { data, setData, errors, setError, clearErrors } = useForm({
        user_id: reserva.user_id,
        espacio_id: reserva.espacio_id,
        escritorio_id: reserva.escritorio_id,
        fecha_inicio: reserva.fecha_inicio.split('T')[0],
        fecha_fin: reserva.fecha_fin.split('T')[0],
        hora_inicio: formatTime(reserva.fecha_inicio),
        hora_fin: formatTime(reserva.fecha_fin),
        tipo_reserva: reserva.tipo_reserva,
        motivo: reserva.motivo || '',
        estado: reserva.estado || 'pendiente',
    });

    // Estados locales del componente
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [showHoras, setShowHoras] = useState(reserva.tipo_reserva === 'hora' || reserva.tipo_reserva === 'medio_dia');
    const [fechaFinCalculada, setFechaFinCalculada] = useState('');
    const [processing, setProcessing] = useState(false);

    // Horarios predefinidos para reservas de medio día
    const [horariosDisponibles] = useState([
        { inicio: '08:00', fin: '14:00', label: 'Mañana (08:00 - 14:00)' },
        { inicio: '14:00', fin: '20:00', label: 'Tarde (14:00 - 20:00)' }
    ]);



    // Efecto para manejar la visibilidad del selector de escritorios
    useEffect(() => {
        const selectedEspacio = espacios.find(espacio => espacio.id === Number(data.espacio_id));
        if (selectedEspacio && selectedEspacio.tipo === 'coworking') {
            setShowEscritorio(true);
            // Corregimos el filtro para usar is_active
            const libres = escritorios.filter(escritorio =>
                escritorio.espacio_id === Number(data.espacio_id) &&
                escritorio.is_active === 1
            );
            setEscritoriosLibres(libres);
        } else {
            setShowEscritorio(false);
            setData('escritorio_id', null);
        }
    }, [data.espacio_id, escritorios, espacios]);

    // Efecto para calcular fecha fin según tipo de reserva
    useEffect(() => {
        setShowHoras(data.tipo_reserva === 'hora' || data.tipo_reserva === 'medio_dia');

        if (data.fecha_inicio) {
            let fechaFin = '';
            const fecha = new Date(data.fecha_inicio);

            switch (data.tipo_reserva) {
                case 'dia_completo':
                    fechaFin = fecha.toISOString().split('T')[0];
                    break;
                case 'semana':
                    fecha.setDate(fecha.getDate() + 6);
                    fechaFin = fecha.toISOString().split('T')[0];
                    break;
                case 'mes':
                    fecha.setMonth(fecha.getMonth() + 1);
                    fecha.setDate(fecha.getDate() - 1);
                    fechaFin = fecha.toISOString().split('T')[0];
                    break;
                default:
                    fechaFin = fecha.toISOString().split('T')[0];
            }

            setData('fecha_fin', fechaFin);
            setFechaFinCalculada(fechaFin);
        }
    }, [data.tipo_reserva, data.fecha_inicio]);

    // Efecto para manejar horarios de medio día
    useEffect(() => {
        if (data.tipo_reserva === 'medio_dia') {
            // Si no hay hora_inicio establecida o no es válida, establecer valor por defecto
            if (!data.hora_inicio || !horariosDisponibles.some(h => h.inicio === data.hora_inicio)) {
                setData('hora_inicio', '08:00');
                setData('hora_fin', '14:00');
            } else {
                // Establecer hora_fin según hora_inicio seleccionada
                const horario = horariosDisponibles.find(h => h.inicio === data.hora_inicio);
                if (horario) {
                    setData('hora_fin', horario.fin);
                }
            }
        }
    }, [data.tipo_reserva, data.hora_inicio]);

    useEffect(() => {
        if (data.tipo_reserva === 'medio_dia') {
            // Ajustar horarios para medio día
            const horaInicio = data.hora_inicio === '08:00' ? '08:00' : '14:00';
            const horaFin = horaInicio === '08:00' ? '14:00' : '23:59';

            setData(data => ({
                ...data,
                hora_inicio: horaInicio,
                hora_fin: horaFin
            }));
        } else if (data.tipo_reserva === 'hora') {
            // Validar que hora_fin sea mayor que hora_inicio
            if (data.hora_fin && data.hora_inicio && data.hora_fin <= data.hora_inicio) {
                setError('hora', 'La hora de fin debe ser mayor a la hora de inicio');
            } else {
                clearErrors('hora');
            }
        }
    }, [data.tipo_reserva, data.hora_inicio, data.hora_fin]);

    // Validación del formulario
    const validateForm = () => {
        clearErrors();
        let isValid = true;

        if (data.tipo_reserva === 'hora') {
            if (!data.hora_inicio || !data.hora_fin) {
                setError('hora', 'Las horas son requeridas para reservas por hora');
                isValid = false;
            } else {
                const inicio = data.hora_inicio.split(':').map(Number);
                const fin = data.hora_fin.split(':').map(Number);

                if (inicio[0] > fin[0] || (inicio[0] === fin[0] && inicio[1] >= fin[1])) {
                    setError('hora', 'La hora de fin debe ser mayor a la hora de inicio');
                    isValid = false;
                }
            }
        }

        return isValid;
    };

    // Manejador del envío del formulario
    const submit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setProcessing(true);
        toast.dismiss();

        const updateData = new FormData();
        updateData.append('_method', 'PATCH');

        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                updateData.append(key, data[key]);
            }
        });

        axios.post(route('superadmin.reservas.update', reserva.id), updateData)
            .then(response => {
                toast.success(response.data.message);
                document.dispatchEvent(new Event('reservaUpdated'));
                onClose();
            })
            .catch(error => {
                setProcessing(false);
                const errorData = error.response?.data?.errors || {};

                if (typeof errorData === 'object') {
                    Object.keys(errorData).forEach(key => {
                        setError(key, Array.isArray(errorData[key]) ?
                            errorData[key].join(', ') :
                            errorData[key]
                        );
                    });

                    const errorMessages = Object.values(errorData)
                        .flat()
                        .filter(Boolean);

                    if (errorMessages.length > 0) {
                        toast.error(errorMessages.join('\n'), {
                            autoClose: false,
                            closeOnClick: true,
                            className: 'whitespace-pre-line'
                        });
                    }
                } else {
                    toast.error('Error al actualizar la reserva');
                }
            });
    };

    // Renderizado del componente
    return (
        <Modal show={true} onClose={onClose} maxWidth="2xl">
            <form onSubmit={submit} className="p-6 max-h-[90vh] overflow-y-auto">
                {/* Campo de usuario (solo lectura) */}
                <div>
                    <InputLabel htmlFor="user_name" value="Reserva Perteneciente a el/la Usuario" className='text-center' />
                    <div className="p-3 text-4xl text-center">
                        <span className="text-blue-600">
                            {users.find(user => user.id === Number(data.user_id))?.name || 'Usuario no encontrado'}
                        </span>
                    </div>
                    <input type="hidden" name="user_id" value={data.user_id} />
                </div>

                {/* Selector de espacio */}
                <div className="mt-6">
                    <InputLabel htmlFor="espacio_id" value="Espacio" />
                    <SelectInput
                        id="espacio_id"
                        value={data.espacio_id}
                        onChange={e => setData('espacio_id', e.target.value)}
                        className="mt-1 block w-full"
                        disabled={processing}
                    >
                        {espacios.map(espacio => (
                            <option key={espacio.id} value={espacio.id}>
                                {espacio.nombre}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.espacio_id} className="mt-2" />
                </div>

                {/* Selector de escritorio (condicional) */}
                {showEscritorio && (
                    <div className="mt-6">
                        <InputLabel htmlFor="escritorio_id" value="Escritorio" />
                        {/* En ReservaModal.jsx */}
                        <SelectInput
                            id="escritorio_id"
                            value={data.escritorio_id}
                            onChange={e => setData('escritorio_id', e.target.value)}
                            className="mt-1 block w-full"
                            disabled={processing}
                        >
                            <option value="">Seleccione un escritorio</option>
                            {escritoriosLibres.map(escritorio => (
                                <option key={escritorio.id} value={escritorio.id}>
                                    {escritorio.numero}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.escritorio_id} className="mt-2" />
                    </div>
                )}

                {/* Grid para tipo de reserva y estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <InputLabel htmlFor="tipo_reserva" value="Tipo de Reserva" />
                        <SelectInput
                            id="tipo_reserva"
                            value={data.tipo_reserva}
                            onChange={e => setData('tipo_reserva', e.target.value)}
                            className="mt-1 block w-full"
                            disabled={processing}
                        >
                            <option value="hora">Por Hora</option>
                            <option value="medio_dia">Medio Día</option>
                            <option value="dia_completo">Día Completo</option>
                            <option value="semana">Semana</option>
                            <option value="mes">Mes</option>
                        </SelectInput>
                        <InputError message={errors.tipo_reserva} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="estado" value="Estado de la Reserva" />
                        <SelectInput
                            id="estado"
                            value={data.estado}
                            onChange={e => setData('estado', e.target.value)}
                            className="mt-1 block w-full"
                            disabled={processing}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                        </SelectInput>
                        <InputError message={errors.estado} className="mt-2" />
                    </div>
                </div>

                {/* Campo de fecha de inicio */}
                <div className="mt-6">
                    <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                    <TextInput
                        id="fecha_inicio"
                        type="date"
                        value={data.fecha_inicio}
                        onChange={e => setData('fecha_inicio', e.target.value)}
                        className="mt-1 block w-full"
                        disabled={processing}
                    />
                    <InputError message={errors.fecha_inicio} className="mt-2" />
                    {fechaFinCalculada && (
                        <p className="mt-2 text-sm text-gray-600">
                            Fecha de finalización: {fechaFinCalculada}
                        </p>
                    )}
                </div>

                {/* Campos de horario (condicionales) */}
                {showHoras && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <InputLabel htmlFor="hora_inicio" value="Horario" />
                            {data.tipo_reserva === 'medio_dia' ? (
                                <>
                                    <SelectInput
                                        id="hora_inicio"
                                        value={data.hora_inicio}
                                        onChange={e => setData('hora_inicio', e.target.value)}
                                        className="mt-1 block w-full"
                                        disabled={processing}
                                    >
                                        <option value="">Seleccione un horario</option>
                                        {horariosDisponibles.map((horario, index) => (
                                            <option key={index} value={horario.inicio}>
                                                {horario.label}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    {data.hora_inicio && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Horario seleccionado: {data.hora_inicio} - {data.hora_fin}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <HourSelectInput
                                    id="hora_inicio"
                                    value={data.hora_inicio}
                                    onChange={e => setData('hora_inicio', e.target.value)}
                                    className="mt-1 block w-full"
                                    disabled={processing}
                                />
                            )}
                            <InputError message={errors.hora_inicio} className="mt-2" />
                        </div>

                        {data.tipo_reserva === 'hora' && (
                            <div>
                                <InputLabel htmlFor="hora_fin" value="Hora de Fin" />
                                <HourSelectInput
                                    id="hora_fin"
                                    value={data.hora_fin}
                                    onChange={e => setData('hora_fin', e.target.value)}
                                    className="mt-1 block w-full"
                                    disabled={processing}
                                />
                                <InputError message={errors.hora_fin} className="mt-2" />
                            </div>
                        )}
                    </div>
                )}

                {/* Campo de motivo */}
                <div className="mt-6">
                    <InputLabel htmlFor="motivo" value="Motivo (Opcional)" />
                    <TextareaInput
                        id="motivo"
                        value={data.motivo}
                        onChange={e => setData('motivo', e.target.value)}
                        className="mt-1 block w-full"
                        rows="3"
                        disabled={processing}
                    />
                    <InputError message={errors.motivo} className="mt-2" />
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>
                        {processing ? 'Procesando...' : 'Guardar Cambios'}
                    </PrimaryButton>
                </div>

                {/* Mensajes de error */}
                {errors.hora && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{errors.hora}</p>
                    </div>
                )}
            </form>
        </Modal>
    );
}