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
import SpaceAvailability from '@/Components/SpaceAvailability'; 
import { toast } from 'react-toastify';
import { format, addDays, addMonths } from 'date-fns'; 

// Importamos la configuración centralizada de horarios
import { 
    HORA_INICIO, 
    HORA_FIN, 
    MEDIO_DIA, 
    DIA_COMPLETO 
} from '@/Config/horarios';

/**
 * Componente para crear y gestionar bloqueos de espacios y escritorios
 * Utiliza la configuración centralizada para los horarios
 */
const BloqueoForm = () => {
    // Obtener el usuario autenticado y sus datos
    // Proporcionamos un valor por defecto para users para evitar errores
    const { auth, users = [], espacios = [], escritorios = [] } = usePage().props;

    // Preparar fechas iniciales
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayFormatted = format(today, 'yyyy-MM-dd');
    const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');

    // Inicializar el formulario con valores por defecto para bloqueo
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: auth.user.role === 'user' ? auth.user.id : '',
        espacio_id: '',
        escritorio_id: null,
        fecha_inicio: todayFormatted,
        fecha_fin: todayFormatted, // Para bloqueos, fecha fin igual a inicio por defecto
        hora_inicio: DIA_COMPLETO.inicio, // Bloqueos usan día completo por defecto
        hora_fin: DIA_COMPLETO.fin,       // Bloqueos usan día completo por defecto
        tipo_bloqueo: 'dia_completo',     // Tipo por defecto
        motivo: '',
    });

    // Estados locales
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [showHoras, setShowHoras] = useState(false); // Los bloqueos por defecto son día completo
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
        
        // Si el espacio es de tipo coworking, mostrar selector de escritorios
        if (espacioSeleccionado && espacioSeleccionado.tipo === 'coworking') {
            setShowEscritorio(true);
            
            // Filtrar escritorios activos que pertenecen al espacio seleccionado
            const libres = escritorios.filter(escritorio => {
                // Verificar que pertenezca al espacio seleccionado
                if (escritorio.espacio_id !== Number(data.espacio_id)) {
                    return false;
                }
                
                // Verificar is_active de forma robusta
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

    // Efecto para calcular fechas según el tipo de bloqueo
    useEffect(() => {
        // Para bloqueos, normalmente no mostramos horas excepto en casos específicos
        const tipoBloqueo = data.tipo_bloqueo || 'dia_completo';
        setShowHoras(tipoBloqueo === 'hora' || tipoBloqueo === 'medio_dia');

        if (data.fecha_inicio) {
            let fechaFin = '';
            const fecha = new Date(data.fecha_inicio);

            // Calcular fecha fin según tipo de bloqueo
            switch (tipoBloqueo) {
                case 'dia_completo':
                    fechaFin = fecha.toISOString().split('T')[0];
                    // Usar valores de configuración centralizada
                    setData('hora_inicio', DIA_COMPLETO.inicio);
                    setData('hora_fin', DIA_COMPLETO.fin);
                    break;
                case 'semana':
                    fecha.setDate(fecha.getDate() + 6);
                    fechaFin = fecha.toISOString().split('T')[0];
                    setData('hora_inicio', DIA_COMPLETO.inicio);
                    setData('hora_fin', DIA_COMPLETO.fin);
                    break;
                case 'mes':
                    fecha.setMonth(fecha.getMonth() + 1);
                    fecha.setDate(fecha.getDate() - 1);
                    fechaFin = fecha.toISOString().split('T')[0];
                    setData('hora_inicio', DIA_COMPLETO.inicio);
                    setData('hora_fin', DIA_COMPLETO.fin);
                    break;
                case 'hora':
                    fechaFin = fecha.toISOString().split('T')[0];
                    // Restaurar hora inicio/fin por defecto
                    setData('hora_inicio', HORA_INICIO);
                    setData('hora_fin', HORA_FIN);
                    break;
                case 'medio_dia':
                    fechaFin = fecha.toISOString().split('T')[0];
                    // Usar configuración de mañana por defecto
                    setData('hora_inicio', MEDIO_DIA.MAÑANA.inicio);
                    setData('hora_fin', MEDIO_DIA.MAÑANA.fin);
                    break;
                default:
                    fechaFin = fecha.toISOString().split('T')[0];
            }

            setData('fecha_fin', fechaFin);
            setFechaFinCalculada(fechaFin);
        }
    }, [data.tipo_bloqueo, data.fecha_inicio]);

    // Efecto para manejar horarios en bloqueos de medio día
    useEffect(() => {
        if (data.tipo_bloqueo === 'medio_dia' && data.hora_inicio) {
            const horario = horariosDisponibles.find(h => h.inicio === data.hora_inicio);
            if (horario) {
                setData('hora_fin', horario.fin);
            }
        }
    }, [data.hora_inicio, data.tipo_bloqueo]);

    // Función para manejar cambios de tipo de bloqueo
    const handleTipoBloqueoChange = (e) => {
        const tipo = e.target.value;
        setData('tipo_bloqueo', tipo);
        
        const fechaInicio = new Date(data.fecha_inicio);
        let fechaFin = new Date(fechaInicio);
        let horaInicio = HORA_INICIO;
        let horaFin = HORA_FIN;
        
        switch (tipo) {
            case 'hora':
                setShowHoras(true);
                break;
                
            case 'medio_dia':
                setShowHoras(true);
                horaInicio = MEDIO_DIA.MAÑANA.inicio;
                horaFin = MEDIO_DIA.MAÑANA.fin;
                break;
                
            case 'dia_completo':
                setShowHoras(false);
                horaInicio = DIA_COMPLETO.inicio;
                horaFin = DIA_COMPLETO.fin;
                break;
                
            case 'semana':
                setShowHoras(false);
                horaInicio = DIA_COMPLETO.inicio;
                horaFin = DIA_COMPLETO.fin;
                fechaFin = addDays(fechaInicio, 6);
                break;
                
            case 'mes':
                setShowHoras(false);
                horaInicio = DIA_COMPLETO.inicio;
                horaFin = DIA_COMPLETO.fin;
                fechaFin = addMonths(fechaInicio, 1);
                fechaFin = addDays(fechaFin, -1);
                break;
        }
        
        if (tipo !== 'hora') {
            const nuevaFechaFin = format(fechaFin, 'yyyy-MM-dd');
            setFechaFinCalculada(nuevaFechaFin);
            setData({
                ...data,
                fecha_fin: nuevaFechaFin,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                tipo_bloqueo: tipo
            });
        } else {
            setFechaFinCalculada('');
            setData({
                ...data,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                tipo_bloqueo: tipo
            });
        }
    };

    // Función para resetear el formulario
    const handleReset = () => {
        const userId = auth.user.role === 'user' ? auth.user.id : '';
        reset();
        setData({
            user_id: userId,
            espacio_id: '',
            escritorio_id: null,
            fecha_inicio: todayFormatted,
            fecha_fin: todayFormatted,
            hora_inicio: DIA_COMPLETO.inicio,
            hora_fin: DIA_COMPLETO.fin,
            tipo_bloqueo: 'dia_completo',
            motivo: '',
        });
        setUserSearchTerm('');
        setShowEscritorio(false);
        setEscritoriosLibres([]);
        setFechaFinCalculada('');
        setShowHoras(false);
        setSelectedSpace(null);
    };

    // Función para manejar el envío del formulario
    const submit = (e) => {
        e.preventDefault();

        const routeName = auth.user.role === 'admin'
            ? 'admin.bloqueos.store'
            : 'superadmin.bloqueos.store';

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

    return (
        <>
            <Head title="Crear Bloqueo" />

            <div className="max-w-7xl mx-auto py-12">
                <h2 className="text-4xl font-bold mb-10 text-indigo-700 text-center">Crear Bloqueo</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna izquierda: Formulario */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <form onSubmit={submit} className="space-y-6">
                            

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
                                    <InputLabel htmlFor="tipo_bloqueo" value="Tipo de Bloqueo" className="text-gray-700 dark:text-gray-300" />
                                    <SelectInput
                                        id="tipo_bloqueo"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                        value={data.tipo_bloqueo || 'dia_completo'}
                                        onChange={handleTipoBloqueoChange}
                                    >
                                        <option value="hora">Por Hora</option>
                                        <option value="medio_dia">Medio Día</option>
                                        <option value="dia_completo">Día Completo</option>
                                        <option value="semana">Semana</option>
                                        <option value="mes">Mes</option>
                                    </SelectInput>
                                    <InputError message={errors.tipo_bloqueo} className="mt-2" />
                                </div>
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
                                {fechaFinCalculada && data.tipo_bloqueo !== 'hora' && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Fecha de finalización: {fechaFinCalculada}
                                    </p>
                                )}
                            </div>

                            {showHoras && (
                                <div className={`grid grid-cols-1 ${data.tipo_bloqueo === 'hora' ? 'md:grid-cols-2' : ''} gap-6`}>
                                    <div className={data.tipo_bloqueo === 'medio_dia' && auth.user.role === 'user' ? 'col-span-full' : ''}>
                                        <InputLabel 
                                            htmlFor="hora_inicio" 
                                            value="Hora de Inicio" 
                                            className="text-gray-700 dark:text-gray-300" 
                                        />
                                        {data.tipo_bloqueo === 'medio_dia' ? (
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

                                    {data.tipo_bloqueo === 'hora' && (
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
                                    value="Motivo del Bloqueo" 
                                    className="text-gray-700 dark:text-gray-300" 
                                />
                                <TextareaInput
                                    id="motivo"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    value={data.motivo}
                                    onChange={e => setData('motivo', e.target.value)}
                                    required
                                />
                                <InputError message={errors.motivo} className="mt-2" />
                            </div>

                            <div className="flex justify-end">
                                <PrimaryButton 
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700"
                                >
                                    Crear Bloqueo
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
        </>
    );
};

// Cambiamos el nombre del componente para mayor coherencia
export default BloqueoForm;