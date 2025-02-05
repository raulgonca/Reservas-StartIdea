import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import TextareaInput from '@/Components/TextareaInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import UserSearch from '@/Components/UserSerch';

export default function CreateReserva() {
    // Inicializar el formulario con los campos necesarios
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        espacio_id: '',
        escritorio_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        hora_inicio: '',
        hora_fin: '',
        tipo_reserva: 'hora',
        motivo: '',
    });

    // Obtener los datos necesarios desde las props de la página
    const { users = [], espacios = [], escritorios = [], flash } = usePage().props;

    // Estados para manejar la visibilidad del selector de escritorios y los escritorios libres
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    // useEffect para manejar el renderizado condicional del selector de escritorios
    useEffect(() => {
        const selectedEspacio = espacios.find(espacio => espacio.id === Number(data.espacio_id));
        if (selectedEspacio && selectedEspacio.tipo === 'coworking') {
            setShowEscritorio(true);
            const libres = escritorios.filter(escritorio => escritorio.espacio_id === Number(data.espacio_id) && escritorio.disponible);
            setEscritoriosLibres(libres);
        } else {
            setShowEscritorio(false);
            setData('escritorio_id', '');
        }
    }, [data.espacio_id, escritorios, espacios]);

    // useEffect para manejar el mensaje de éxito
    useEffect(() => {
        if (flash?.success) {
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000); // Ocultar el mensaje de éxito después de 5 segundos
        }
        if (flash?.error) {
            setShowErrorMessage(true);
            setTimeout(() => {
                setShowErrorMessage(false);
            }, 5000); // Ocultar el mensaje de error después de 5 segundos
        }
    }, [flash?.success, flash?.error]);

    // Función para manejar el envío del formulario
    const submit = (e) => {
        e.preventDefault();
        post(route('superadmin.reservas.store'));
    };

    // Obtener la fecha de hoy en formato ISO
    const today = new Date().toISOString().split('T')[0];

    return (
        <AuthenticatedLayout>
            <Head title="Crear Reserva" />
            <div className="max-w-2xl mx-auto py-12">
                <h1 className="text-2xl font-bold mb-6 text-center">Crear Reserva</h1>

                {showSuccessMessage && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {flash.success}
                    </div>
                )}
                {showErrorMessage && (
                    <div className="mb-4 text-sm font-medium text-red-600">
                        {flash.error}
                    </div>
                )}

                <ApplicationLogo />
                <form onSubmit={submit}>
                    <UserSearch
                        users={users}
                        value={data.user_id}
                        onChange={(value) => setData('user_id', value)}
                        error={errors.user_id}
                    />
                    <div className="mb-4">
                        <InputLabel htmlFor="espacio_id" value="Espacio" />
                        <SelectInput
                            name="espacio_id"
                            value={data.espacio_id}
                            onChange={(e) => setData('espacio_id', e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="" disabled hidden>
                                Seleccione un espacio
                            </option>
                            {espacios.map(espacio => (
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
                                onChange={(e) => setData('escritorio_id', e.target.value)}
                                className="mt-1 block w-full"
                            >
                                <option value="" disabled hidden>
                                    Seleccione un escritorio
                                </option>
                                {escritoriosLibres.map(escritorio => (
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
                            onChange={(e) => setData('tipo_reserva', e.target.value)}
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
                    {data.tipo_reserva === 'hora' && (
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
                                    onChange={(e) => setData('fecha_inicio', e.target.value)}
                                />
                                <InputError message={errors.fecha_inicio} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel htmlFor="hora_inicio" value="Hora Inicio" />
                                <TextInput
                                    type="time"
                                    name="hora_inicio"
                                    value={data.hora_inicio}
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    onChange={(e) => setData('hora_inicio', e.target.value)}
                                />
                                <InputError message={errors.hora_inicio} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel htmlFor="hora_fin" value="Hora Fin" />
                                <TextInput
                                    type="time"
                                    name="hora_fin"
                                    value={data.hora_fin}
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    onChange={(e) => setData('hora_fin', e.target.value)}
                                />
                                <InputError message={errors.hora_fin} className="mt-2" />
                            </div>
                        </>
                    )}
                    {data.tipo_reserva === 'medio_dia' || data.tipo_reserva === 'dia_completo' ? (
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
                                    onChange={(e) => setData('fecha_inicio', e.target.value)}
                                />
                                <InputError message={errors.fecha_inicio} className="mt-2" />
                            </div>
                            {data.tipo_reserva === 'medio_dia' && (
                                <>
                                    <div className="mb-4">
                                        <InputLabel htmlFor="hora_inicio" value="Hora Inicio" />
                                        <TextInput
                                            type="time"
                                            name="hora_inicio"
                                            value={data.hora_inicio}
                                            className="mt-1 block w-full"
                                            autoComplete="off"
                                            onChange={(e) => setData('hora_inicio', e.target.value)}
                                        />
                                        <InputError message={errors.hora_inicio} className="mt-2" />
                                    </div>
                                    <div className="mb-4">
                                        <InputLabel htmlFor="hora_fin" value="Hora Fin" />
                                        <TextInput
                                            type="time"
                                            name="hora_fin"
                                            value={data.hora_fin}
                                            className="mt-1 block w-full"
                                            autoComplete="off"
                                            onChange={(e) => setData('hora_fin', e.target.value)}
                                        />
                                        <InputError message={errors.hora_fin} className="mt-2" />
                                    </div>
                                </>
                            )}
                        </>
                    ) : null}
                    {data.tipo_reserva === 'semana' && (
                        <>
                            <div className="mb-4">
                                <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                                <TextInput
                                    type="date"
                                    name="fecha_inicio"
                                    value={data.fecha_inicio}
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    min={today}
                                    onChange={(e) => setData('fecha_inicio', e.target.value)}
                                />
                                <InputError message={errors.fecha_inicio} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel htmlFor="fecha_fin" value="Fecha de Fin" />
                                <TextInput
                                    type="date"
                                    name="fecha_fin"
                                    value={data.fecha_fin}
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    min={data.fecha_inicio || today}
                                    onChange={(e) => setData('fecha_fin', e.target.value)}
                                />
                                <InputError message={errors.fecha_fin} className="mt-2" />
                            </div>
                        </>
                    )}
                    {data.tipo_reserva === 'mes' && (
                        <>
                            <div className="mb-4">
                                <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                                <TextInput
                                    type="date"
                                    name="fecha_inicio"
                                    value={data.fecha_inicio}
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    min={today}
                                    onChange={(e) => setData('fecha_inicio', e.target.value)}
                                />
                                <InputError message={errors.fecha_inicio} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel htmlFor="fecha_fin" value="Fecha de Fin" />
                                <TextInput
                                    type="date"
                                    name="fecha_fin"
                                    value={data.fecha_fin}
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    min={data.fecha_inicio || today}
                                    onChange={(e) => setData('fecha_fin', e.target.value)}
                                />
                                <InputError message={errors.fecha_fin} className="mt-2" />
                            </div>
                        </>
                    )}
                    <div className="mb-4">
                        <InputLabel htmlFor="motivo" value="Motivo" />
                        <TextareaInput
                            name="motivo"
                            value={data.motivo}
                            onChange={(e) => setData('motivo', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.motivo} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-between">
                        <SecondaryButton type="button" onClick={() => window.location.href = route('dashboard')}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton type="submit" className="px-4 py-2 bg-blue-600 text-white" disabled={processing}>
                            Crear Reserva
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}