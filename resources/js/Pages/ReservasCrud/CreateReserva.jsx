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
import SpaceAvailability from '@/Components/SpaceAvailability'; // Nuevo import
import { toast } from 'react-toastify';
import { format, addDays, addMonths } from 'date-fns'; // Añadimos estas funciones

// Importamos la configuración centralizada de horarios
import { 
    HORA_INICIO, 
    HORA_FIN, 
    MEDIO_DIA, 
    DIA_COMPLETO 
} from '@/Config/horarios';

const CreateReserva = () => {
    // Obtener el usuario autenticado y sus datos
    const { auth, users, espacios, escritorios } = usePage().props;

    // Preparar fechas iniciales
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayFormatted = format(today, 'yyyy-MM-dd');
    const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');

    // Inicializar el formulario con valores por defecto
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: auth.user.role === 'user' ? auth.user.id : '',
        espacio_id: '',
        escritorio_id: null,
        fecha_inicio: todayFormatted,
        fecha_fin: tomorrowFormatted,
        hora_inicio: HORA_INICIO, // Usamos la configuración centralizada
        hora_fin: '18:00',
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
    
    // Usar configuración centralizada para horarios de medio día
    const [horariosDisponibles] = useState([
        { 
            inicio: MEDIO_DIA.MAÑANA.inicio, 
            fin: MEDIO_DIA.MAÑANA.fin, 
            label: MEDIO_DIA.MAÑANA.label 
        },
        { 
            inicio: MEDIO_DIA.TARDE.inicio, 
            fin: MEDIO_DIA.TARDE.fin, 
            label: MEDIO_DIA.TARDE.label 
        }
    ]);
    
    const [selectedSpace, setSelectedSpace] = useState(null);

    // Efecto para manejar la visibilidad y disponibilidad de escritorios
    useEffect(() => {
        if (!data.espacio_id) {
            setShowEscritorio(false);
            setEscritoriosLibres([]);
            setSelectedSpace(null);
            return;
        }

        const espacioId = Number(data.espacio_id);
        const espacioSeleccionado = espacios.find(espacio => espacio.id === espacioId);
        setSelectedSpace(espacioSeleccionado);
        
        if (espacioSeleccionado && espacioSeleccionado.tipo === 'coworking') {
            setShowEscritorio(true);
            
            // Filtrar escritorios activos
            const libres = escritorios.filter(escritorio => {
                // Comprobar que pertenece al espacio seleccionado
                if (escritorio.espacio_id !== Number(data.espacio_id)) {
                    return false;
                }
                
                // Verificar is_active de forma más robusta
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
                    // Usamos valores de la configuración centralizada
                    setData('hora_inicio', DIA_COMPLETO.inicio);
                    setData('hora_fin', DIA_COMPLETO.fin);
                    break;
                case 'semana':
                    fecha.setDate(fecha.getDate() + 6);
                    fechaFin = fecha.toISOString().split('T')[0];
                    // Usamos valores de la configuración centralizada
                    setData('hora_inicio', DIA_COMPLETO.inicio);
                    setData('hora_fin', DIA_COMPLETO.fin);
                    break;
                case 'mes':
                    fecha.setMonth(fecha.getMonth() + 1);
                    fecha.setDate(fecha.getDate() - 1);
                    fechaFin = fecha.toISOString().split('T')[0];
                    // Usamos valores de la configuración centralizada
                    setData('hora_inicio', DIA_COMPLETO.inicio);
                    setData('hora_fin', DIA_COMPLETO.fin);
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
        setData({
            user_id: userId,
            espacio_id: '',
            escritorio_id: null,
            fecha_inicio: todayFormatted,
            fecha_fin: tomorrowFormatted,
            hora_inicio: HORA_INICIO, // Usar valor de configuración
            hora_fin: '18:00',
            tipo_reserva: 'hora',
            motivo: '',
            estado: 'pendiente',
        });
        setUserSearchTerm('');
        setShowEscritorio(false);
        setEscritoriosLibres([]);
        setFechaFinCalculada('');
        setShowHoras(true);
        setSelectedSpace(null);
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

    // El resto del componente permanece igual
    return (
        <AuthenticatedLayout>
            <Head title="Crear Reserva" />

            <div className="max-w-7xl mx-auto py-12">
                <h2 className="text-4xl font-bold mb-10 text-indigo-700 text-center">Crear Reserva</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna izquierda: Formulario */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
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
                                <InputLabel htmlFor="espacio_id" value="Espacio" className="text-gray-700 dark:text-gray-300" />
                                <SelectInput
                                    id="espacio_id"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                                    <InputLabel htmlFor="escritorio_id" value="Escritorio" className="text-gray-700 dark:text-gray-300" />
                                    <SelectInput
                                        id="escritorio_id"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                                    <InputLabel htmlFor="tipo_reserva" value="Tipo de Reserva" className="text-gray-700 dark:text-gray-300" />
                                    <SelectInput
                                        id="tipo_reserva"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                                        <InputLabel htmlFor="estado" value="Estado de la Reserva" className="text-gray-700 dark:text-gray-300" />
                                        <SelectInput
                                            id="estado"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                                <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" className="text-gray-700 dark:text-gray-300" />
                                <TextInput
                                    id="fecha_inicio"
                                    type="date"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    value={data.fecha_inicio}
                                    onChange={e => setData('fecha_inicio', e.target.value)}
                                    min={todayFormatted}
                                    required
                                />
                                <InputError message={errors.fecha_inicio} className="mt-2" />
                                {fechaFinCalculada && data.tipo_reserva !== 'hora' && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Fecha de finalización: {fechaFinCalculada}
                                    </p>
                                )}
                            </div>

                            {showHoras && (
                                <div className={`grid grid-cols-1 ${data.tipo_reserva === 'hora' ? 'md:grid-cols-2' : ''} gap-6`}>
                                    <div className={data.tipo_reserva === 'medio_dia' && auth.user.role === 'user' ? 'col-span-full' : ''}>
                                        <InputLabel 
                                            htmlFor="hora_inicio" 
                                            value="Hora de Inicio" 
                                            className="text-gray-700 dark:text-gray-300" 
                                        />
                                        {data.tipo_reserva === 'medio_dia' ? (
                                            <>
                                                <SelectInput
                                                    id="hora_inicio"
                                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        Horario seleccionado: {data.hora_inicio} - {data.hora_fin}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <HourSelectInput
                                                id="hora_inicio"
                                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                value={data.hora_inicio}
                                                onChange={e => setData('hora_inicio', e.target.value)}
                                                required
                                            />
                                        )}
                                        <InputError message={errors.hora_inicio} className="mt-2" />
                                    </div>

                                    {data.tipo_reserva === 'hora' && (
                                        <div>
                                            <InputLabel 
                                                htmlFor="hora_fin" 
                                                value="Hora de Fin" 
                                                className="text-gray-700 dark:text-gray-300" 
                                            />
                                            <HourSelectInput
                                                id="hora_fin"
                                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                                <InputLabel 
                                    htmlFor="motivo" 
                                    value="Motivo (Opcional)" 
                                    className="text-gray-700 dark:text-gray-300" 
                                />
                                <TextareaInput
                                    id="motivo"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    value={data.motivo}
                                    onChange={e => setData('motivo', e.target.value)}
                                />
                                <InputError message={errors.motivo} className="mt-2" />
                            </div>

                            <div className="flex justify-end">
                                <PrimaryButton 
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700"
                                >
                                    Crear Reserva
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                    
                    {/* Columna derecha: Visualización de disponibilidad */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        {selectedSpace ? (
                            <SpaceAvailability space={selectedSpace} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-12">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p className="text-center">Seleccione un espacio para visualizar su disponibilidad</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CreateReserva;