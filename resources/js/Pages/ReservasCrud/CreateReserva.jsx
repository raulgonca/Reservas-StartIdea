import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import TextareaInput from '@/Components/TextareaInput';
import HourSelectInput from '@/Components/HourSelectInput';
import UserSearch from '@/Components/UserSearch';
import { toast } from 'react-toastify';

export default function CreateReserva() {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        espacio_id: '',
        escritorio_id: null,
        fecha_inicio: '',
        fecha_fin: '',
        hora_inicio: '',
        hora_fin: '',
        tipo_reserva: 'hora',
        motivo: '',
        estado: 'pendiente',
    });

    const { users, espacios, escritorios, flash = {} } = usePage().props;
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [showHoras, setShowHoras] = useState(true);
    const [fechaFinCalculada, setFechaFinCalculada] = useState('');
    const [horariosDisponibles] = useState([
        { inicio: '08:00', fin: '14:00', label: 'Mañana (08:00 - 14:00)' },
        { inicio: '14:00', fin: '20:00', label: 'Tarde (14:00 - 20:00)' }
    ]);

    useEffect(() => {
        const selectedEspacio = espacios.find(espacio => espacio.id === Number(data.espacio_id));
        if (selectedEspacio && selectedEspacio.tipo === 'coworking') {
            setShowEscritorio(true);
            const libres = escritorios.filter(escritorio => 
                escritorio.espacio_id === Number(data.espacio_id) && escritorio.disponible
            );
            setEscritoriosLibres(libres);
        } else {
            setShowEscritorio(false);
            setData('escritorio_id', null);
        }
    }, [data.espacio_id, escritorios, espacios]);

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

    useEffect(() => {
        if (data.tipo_reserva === 'medio_dia' && data.hora_inicio) {
            const horario = horariosDisponibles.find(h => h.inicio === data.hora_inicio);
            if (horario) {
                setData('hora_fin', horario.fin);
            }
        }
    }, [data.hora_inicio, data.tipo_reserva]);

    const handleReset = () => {
        reset();
        setUserSearchTerm('');
        setShowEscritorio(false);
        setEscritoriosLibres([]);
        setFechaFinCalculada('');
        setShowHoras(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('superadmin.reservas.store'), {
            onSuccess: (response) => {
                // Construir mensaje detallado
                const usuario = users.find(u => u.id === Number(data.user_id));
                const espacio = espacios.find(e => e.id === Number(data.espacio_id));
                const escritorio = escritorios.find(e => e.id === Number(data.escritorio_id));
    
                const mensajeExito = [
                    "¡Reserva creada exitosamente!",
                    `Usuario: ${usuario?.name || 'No especificado'}`,
                    `Email: ${usuario?.email || 'No especificado'}`,
                    `Espacio: ${espacio?.nombre || 'No especificado'}`
                ];
    
                if (escritorio) {
                    mensajeExito.push(`Escritorio: ${escritorio.nombre}`);
                }
    
                mensajeExito.push(
                    `Fecha de Inicio: ${data.fecha_inicio} ${data.hora_inicio || ''}`,
                    `Fecha de Fin: ${data.fecha_fin} ${data.hora_fin || ''}`,
                    `Tipo de Reserva: ${data.tipo_reserva}`,
                    data.motivo ? `Motivo: ${data.motivo}` : null
                );
    
                // Mostrar mensaje detallado
                toast.success(mensajeExito.filter(Boolean).join('\n'), {
                    autoClose: 5000, // Dar más tiempo para leer el mensaje
                    style: { whiteSpace: 'pre-line' } // Mantener saltos de línea
                });
    
                handleReset();
            },
            onError: (errors) => {
                const uniqueErrors = [...new Set(Object.values(errors))];
                uniqueErrors.forEach(error => toast.error(error));
            }
        });
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <AuthenticatedLayout>
            <Head title="Crear Reserva" />

            <div className="max-w-2xl mx-auto py-12">
                <form onSubmit={submit} className="space-y-6">
                    {/* Buscador de Usuario */}
                    <UserSearch
                        users={users}
                        value={userSearchTerm}
                        onChange={(value) => {
                            setUserSearchTerm(value);
                            setData('user_id', value);
                        }}
                        error={errors.user_id}
                    />

                    {/* Espacio */}
                    <div>
                        <InputLabel htmlFor="espacio_id" value="Espacio" />
                        <SelectInput
                            id="espacio_id"
                            className="mt-1 block w-full"
                            value={data.espacio_id}
                            onChange={e => setData('espacio_id', e.target.value)}
                        >
                            <option value="">Seleccione un espacio</option>
                            {espacios.map(espacio => (
                                <option key={espacio.id} value={espacio.id}>
                                    {espacio.nombre}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.espacio_id} className="mt-2" />
                    </div>

                    {/* Escritorio (condicional) */}
                    {showEscritorio && (
                        <div>
                            <InputLabel htmlFor="escritorio_id" value="Escritorio" />
                            <SelectInput
                                id="escritorio_id"
                                className="mt-1 block w-full"
                                value={data.escritorio_id}
                                onChange={e => setData('escritorio_id', e.target.value)}
                            >
                                <option value="">Seleccione un escritorio</option>
                                {escritoriosLibres.map(escritorio => (
                                    <option key={escritorio.id} value={escritorio.id}>
                                        {escritorio.nombre}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.escritorio_id} className="mt-2" />
                        </div>
                    )}

                    {/* Grid para tipo de reserva y estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tipo de Reserva */}
                        <div>
                            <InputLabel htmlFor="tipo_reserva" value="Tipo de Reserva" />
                            <SelectInput
                                id="tipo_reserva"
                                className="mt-1 block w-full"
                                value={data.tipo_reserva}
                                onChange={e => setData('tipo_reserva', e.target.value)}
                            >
                                <option value="hora">Por Hora</option>
                                <option value="medio_dia">Medio Día</option>
                                <option value="dia_completo">Día Completo</option>
                                <option value="semana">Semana</option>
                                <option value="mes">Mes</option>
                            </SelectInput>
                            <InputError message={errors.tipo_reserva} className="mt-2" />
                        </div>

                        {/* Estado */}
                        <div>
                            <InputLabel htmlFor="estado" value="Estado de la Reserva" />
                            <SelectInput
                                id="estado"
                                className="mt-1 block w-full"
                                value={data.estado}
                                onChange={e => setData('estado', e.target.value)}
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="cancelada">Cancelada</option>
                            </SelectInput>
                            <InputError message={errors.estado} className="mt-2" />
                        </div>
                    </div>

                    {/* Fecha de Inicio */}
                    <div>
                        <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                        <TextInput
                            id="fecha_inicio"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_inicio}
                            onChange={e => setData('fecha_inicio', e.target.value)}
                            min={today}
                        />
                        <InputError message={errors.fecha_inicio} className="mt-2" />
                        {fechaFinCalculada && (
                            <p className="mt-2 text-sm text-gray-600">
                                Fecha de finalización: {fechaFinCalculada}
                            </p>
                        )}
                    </div>

                    {/* Horarios */}
                    {showHoras && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="hora_inicio" value="Hora de Inicio" />
                                {data.tipo_reserva === 'medio_dia' ? (
                                    <>
                                        <SelectInput
                                            id="hora_inicio"
                                            className="mt-1 block w-full"
                                            value={data.hora_inicio}
                                            onChange={e => setData('hora_inicio', e.target.value)}
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
                                        className="mt-1 block w-full"
                                        value={data.hora_inicio}
                                        onChange={e => setData('hora_inicio', e.target.value)}
                                    />
                                )}
                                <InputError message={errors.hora_inicio} className="mt-2" />
                            </div>

                            {data.tipo_reserva === 'hora' && (
                                <div>
                                    <InputLabel htmlFor="hora_fin" value="Hora de Fin" />
                                    <HourSelectInput
                                        id="hora_fin"
                                        className="mt-1 block w-full"
                                        value={data.hora_fin}
                                        onChange={e => setData('hora_fin', e.target.value)}
                                    />
                                    <InputError message={errors.hora_fin} className="mt-2" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Motivo */}
                    <div>
                        <InputLabel htmlFor="motivo" value="Motivo (Opcional)" />
                        <TextareaInput
                            id="motivo"
                            className="mt-1 block w-full"
                            value={data.motivo}
                            onChange={e => setData('motivo', e.target.value)}
                        />
                        <InputError message={errors.motivo} className="mt-2" />
                    </div>

                    {/* Botón Submit */}
                    <div className="flex justify-end">
                        <PrimaryButton disabled={processing}>
                            Crear Reserva
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}