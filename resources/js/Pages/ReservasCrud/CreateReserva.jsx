import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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

const CreateReserva = () => {
    // Obtener el usuario autenticado y sus datos
    const { auth, users, espacios, escritorios } = usePage().props;

    // Inicializar el formulario con valores por defecto
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: auth.user.role === 'user' ? auth.user.id : '',
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

    // Estados locales
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [showHoras, setShowHoras] = useState(true);
    const [fechaFinCalculada, setFechaFinCalculada] = useState('');
    const [horariosDisponibles] = useState([
        { inicio: '08:00', fin: '14:00', label: 'Mañana (08:00 - 14:00)' },
        { inicio: '14:00', fin: '20:00', label: 'Tarde (14:00 - 20:00)' }
    ]);

    // Efecto para manejar la visibilidad y disponibilidad de escritorios
    useEffect(() => {
        if (!data.espacio_id) return;

        const selectedEspacio = espacios.find(
            espacio => espacio.id === Number(data.espacio_id)
        );
        
        if (selectedEspacio && selectedEspacio.tipo === 'coworking') {
            setShowEscritorio(true);
            
            // CORRECCIÓN: Mejorar la forma de filtrar escritorios activos
            const libres = escritorios.filter(escritorio => {
                // Comprobar que pertenece al espacio seleccionado
                if (escritorio.espacio_id !== Number(data.espacio_id)) {
                    return false;
                }
                
                // Verificar is_active de forma más robusta (acepta 1, true, "1", etc.)
                return escritorio.is_active === true || 
                       escritorio.is_active === 1 || 
                       escritorio.is_active === '1';
            });
            
            console.log('Escritorios disponibles:', libres);
            setEscritoriosLibres(libres);
        } else {
            setShowEscritorio(false);
            setData('escritorio_id', null);
        }
    }, [data.espacio_id, escritorios, espacios]);

    // Efecto para calcular fechas según el tipo de reserva
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

    // Efecto para manejar horarios en reservas de medio día
    useEffect(() => {
        if (data.tipo_reserva === 'medio_dia' && data.hora_inicio) {
            const horario = horariosDisponibles.find(h => h.inicio === data.hora_inicio);
            if (horario) {
                setData('hora_fin', horario.fin);
            }
        }
    }, [data.hora_inicio, data.tipo_reserva]);

    // Función para resetear el formulario
    const handleReset = () => {
        const userId = auth.user.role === 'user' ? auth.user.id : '';
        reset();
        setData('user_id', userId);
        setUserSearchTerm('');
        setShowEscritorio(false);
        setEscritoriosLibres([]);
        setFechaFinCalculada('');
        setShowHoras(true);
    };

    // Función para manejar el envío del formulario
    const submit = (e) => {
        e.preventDefault();

        const routeName = auth.user.role === 'user'
            ? 'user.reservas.store'
            : auth.user.role === 'admin'
                ? 'admin.reservas.store'
                : 'superadmin.reservas.store';

        post(route(routeName), {
            onSuccess: (page) => {
                if (page.props.flash.success) {
                    toast.success(page.props.flash.success, {
                        autoClose: 5000,
                        style: { whiteSpace: 'pre-line' }
                    });
                }
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
                    {auth.user.role !== 'user' && (
                        <UserSearch
                            users={users}
                            value={userSearchTerm}
                            onChange={(value) => {
                                setUserSearchTerm(value);
                                setData('user_id', value);
                            }}
                            error={errors.user_id}
                        />
                    )}

                    {auth.user.role === 'user' && (
                        <input
                            type="hidden"
                            name="user_id"
                            value={auth.user.id}
                        />
                    )}

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

                    {showEscritorio && (
                        <div>
                            <InputLabel htmlFor="escritorio_id" value="Escritorio" />
                            <SelectInput
                                id="escritorio_id"
                                className="mt-1 block w-full"
                                value={data.escritorio_id}
                                onChange={e => setData('escritorio_id', e.target.value)}
                                required
                            >
                                <option value="">Seleccione un escritorio</option>
                                {escritoriosLibres.length > 0 ? (
                                    escritoriosLibres.map(escritorio => (
                                        <option key={escritorio.id} value={escritorio.id}>
                                            {escritorio.numero}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No hay escritorios disponibles</option>
                                )}
                            </SelectInput>
                            <InputError message={errors.escritorio_id} className="mt-2" />
                            {escritoriosLibres.length === 0 && data.espacio_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    No hay escritorios disponibles para este espacio.
                                </p>
                            )}
                        </div>
                    )}

                    <div className={`grid grid-cols-1 ${auth.user.role !== 'user' ? 'md:grid-cols-2' : ''} gap-6`}>
                        <div className={auth.user.role === 'user' ? 'col-span-full' : ''}>
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

                        {auth.user.role !== 'user' && (
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
                        )}
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                        <TextInput
                            id="fecha_inicio"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_inicio}
                            onChange={e => setData('fecha_inicio', e.target.value)}
                            min={today}
                            required
                        />
                        <InputError message={errors.fecha_inicio} className="mt-2" />
                        {fechaFinCalculada && (
                            <p className="mt-2 text-sm text-gray-600">
                                Fecha de finalización: {fechaFinCalculada}
                            </p>
                        )}
                    </div>

                    {showHoras && (
                        <div className={`grid grid-cols-1 ${data.tipo_reserva === 'hora' ? 'md:grid-cols-2' : ''} gap-6`}>
                            <div className={data.tipo_reserva === 'medio_dia' && auth.user.role === 'user' ? 'col-span-full' : ''}>
                                <InputLabel htmlFor="hora_inicio" value="Hora de Inicio" />
                                {data.tipo_reserva === 'medio_dia' ? (
                                    <>
                                        <SelectInput
                                            id="hora_inicio"
                                            className="mt-1 block w-full"
                                            value={data.hora_inicio}
                                            onChange={e => setData('hora_inicio', e.target.value)}
                                            required
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
                                        required
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
                                        required
                                    />
                                    <InputError message={errors.hora_fin} className="mt-2" />
                                </div>
                            )}
                        </div>
                    )}

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

                    <div className="flex justify-end">
                        <PrimaryButton disabled={processing}>
                            Crear Reserva
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default CreateReserva;