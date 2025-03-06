import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import HourSelectInput from '@/Components/HourSelectInput';
import SpaceAvailability from '@/Components/SpaceAvailability';
import { Head } from '@inertiajs/react';
import { format, parse, addHours, addDays, addMonths, setMinutes, setSeconds } from 'date-fns';
import { toast } from 'react-toastify';

export default function BloqueoForm({ bloqueo = null, espacios = [], escritorios = [], mode = 'create' }) {
    const { auth } = usePage().props;
    const isEditing = mode === 'edit';
    const title = isEditing ? 'Editar Bloqueo' : 'Crear Bloqueo';
    
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayFormatted = format(today, 'yyyy-MM-dd');
    const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');
    
    // Estado para determinar si se calculó automáticamente la fecha de fin
    const [fechaFinCalculada, setFechaFinCalculada] = useState('');
    const [showHoras, setShowHoras] = useState(true);
    
    // Horarios predefinidos para medio día
    const [horariosDisponibles] = useState([
        { inicio: '08:00', fin: '14:00', label: 'Mañana (08:00 - 14:00)' },
        { inicio: '14:00', fin: '20:00', label: 'Tarde (14:00 - 20:00)' }
    ]);

    // Inicializar valores del formulario
    const { data, setData, post, put, errors, processing } = useForm({
        espacio_id: bloqueo?.espacio_id || '',
        escritorio_id: bloqueo?.escritorio_id || '',
        tipo_bloqueo: bloqueo ? determinarTipoBloqueo(bloqueo) : 'hora',
        fecha_inicio: bloqueo?.fecha_inicio 
            ? format(new Date(bloqueo.fecha_inicio), 'yyyy-MM-dd')
            : todayFormatted,
        fecha_fin: bloqueo?.fecha_fin 
            ? format(new Date(bloqueo.fecha_fin), 'yyyy-MM-dd')
            : tomorrowFormatted,
        hora_inicio: bloqueo?.fecha_inicio 
            ? format(new Date(bloqueo.fecha_inicio), 'HH:00')
            : '08:00',
        hora_fin: bloqueo?.fecha_fin 
            ? format(new Date(bloqueo.fecha_fin), 'HH:00')
            : '18:00',
        motivo: bloqueo?.motivo || '',
        creado_por: auth.user.id
    });

    // Función para determinar el tipo de bloqueo al editar
    function determinarTipoBloqueo(bloqueo) {
        const fechaInicio = new Date(bloqueo.fecha_inicio);
        const fechaFin = new Date(bloqueo.fecha_fin);
        const horaInicio = fechaInicio.getHours();
        const horaFin = fechaFin.getHours();
        const difDias = Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
        
        // Verificar si es medio día
        if (difDias === 0) {
            if ((horaInicio === 8 && horaFin === 14) || (horaInicio === 14 && horaFin === 20)) {
                return 'medio_dia';
            }
            if (horaInicio === 0 && horaFin === 23) {
                return 'dia_completo';
            }
            return 'hora';
        }
        
        // Verificar si es semana o mes
        if (difDias >= 28 && difDias <= 31) return 'mes';
        if (difDias === 7) return 'semana';
        if (difDias === 1 && horaInicio === 0 && horaFin === 23) return 'dia_completo';
        
        return 'hora';
    }

    // Estados para manejar la visibilidad y disponibilidad de escritorios
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);

    // Efecto para manejar la visibilidad y disponibilidad de escritorios
    useEffect(() => {
        if (!data.espacio_id) {
            setShowEscritorio(false);
            setEscritoriosLibres([]);
            setSelectedSpace(null);
            return;
        }

        // Convertir a número para asegurar comparaciones correctas
        const espacioId = Number(data.espacio_id);
        
        // Actualizar el espacio seleccionado para el componente de disponibilidad
        const espacioSeleccionado = espacios.find(espacio => espacio.id === espacioId);
        setSelectedSpace(espacioSeleccionado);
        
        // Filtrar escritorios que pertenecen al espacio seleccionado
        const libres = escritorios.filter(escritorio => {
            return escritorio.espacio_id === espacioId;
        });
        
        if (libres.length > 0) {
            setShowEscritorio(true);
            setEscritoriosLibres(libres);
        } else {
            setShowEscritorio(false);
            setEscritoriosLibres([]);
            setData('escritorio_id', '');
        }
        
    }, [data.espacio_id, escritorios, espacios]);
    
    // Efecto para calcular fechas según el tipo de bloqueo
    useEffect(() => {
        setShowHoras(data.tipo_bloqueo === 'hora' || data.tipo_bloqueo === 'medio_dia');

        if (data.fecha_inicio) {
            let fechaFin = '';
            const fecha = new Date(data.fecha_inicio);

            switch (data.tipo_bloqueo) {
                case 'dia_completo':
                    fechaFin = data.fecha_inicio; // Mismo día
                    setData('hora_inicio', '00:00');
                    setData('hora_fin', '23:00');
                    break;
                case 'semana':
                    const fechaSemana = addDays(fecha, 6);
                    fechaFin = format(fechaSemana, 'yyyy-MM-dd');
                    setData('hora_inicio', '00:00');
                    setData('hora_fin', '23:00');
                    break;
                case 'mes':
                    const fechaMes = addDays(addMonths(fecha, 1), -1);
                    fechaFin = format(fechaMes, 'yyyy-MM-dd');
                    setData('hora_inicio', '00:00');
                    setData('hora_fin', '23:00');
                    break;
                default:
                    fechaFin = data.fecha_inicio; // Por defecto, mismo día
            }

            if (data.tipo_bloqueo !== 'hora') {
                setData('fecha_fin', fechaFin);
                setFechaFinCalculada(fechaFin);
            } else {
                setFechaFinCalculada('');
            }
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Construir las fechas completas combinando fecha y hora
        const fechaInicioCompleta = `${data.fecha_inicio}T${data.hora_inicio}`;
        const fechaFinCompleta = `${data.fecha_fin}T${data.hora_fin}`;
        
        // Validación para asegurar que la fecha fin es posterior a la fecha inicio
        const inicio = new Date(fechaInicioCompleta);
        const fin = new Date(fechaFinCompleta);
        
        if (fin <= inicio) {
            toast.error('La fecha y hora de fin debe ser posterior a la fecha y hora de inicio');
            return;
        }
        
        // Preparar los datos para enviar
        const formData = {
            espacio_id: data.espacio_id,
            escritorio_id: data.escritorio_id,
            fecha_inicio: fechaInicioCompleta,
            fecha_fin: fechaFinCompleta,
            motivo: data.motivo,
            creado_por: data.creado_por
        };
        
        const baseUrl = auth.user.role === 'superadmin' 
            ? '/v1/superadmin/bloqueos'
            : '/v1/admin/bloqueos';
            
        if (isEditing) {
            put(`${baseUrl}/${bloqueo.id}`, formData, {
                onSuccess: (page) => {
                    if (page.props.flash.success) {
                        toast.success(page.props.flash.success);
                    }
                },
                onError: (errors) => {
                    const uniqueErrors = [...new Set(Object.values(errors))];
                    uniqueErrors.forEach(error => toast.error(error));
                }
            });
        } else {
            post(baseUrl, formData, {
                onSuccess: (page) => {
                    if (page.props.flash.success) {
                        toast.success(page.props.flash.success);
                    }
                },
                onError: (errors) => {
                    const uniqueErrors = [...new Set(Object.values(errors))];
                    uniqueErrors.forEach(error => toast.error(error));
                }
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={title} />

            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
                    
                    {/* Layout de dos columnas para pantallas medianas y grandes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Columna izquierda: Formulario */}
                        <div className="bg-dark p-6 rounded-lg shadow">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="espacio_id" value="Espacio" />
                                    <SelectInput
                                        id="espacio_id"
                                        name="espacio_id"
                                        value={data.espacio_id}
                                        className="mt-1 block w-full"
                                        onChange={e => setData('espacio_id', e.target.value)}
                                    >
                                        <option value="">-- Seleccione un espacio --</option>
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
                                        <InputLabel htmlFor="escritorio_id" value="Escritorio (Opcional)" />
                                        <SelectInput
                                            id="escritorio_id"
                                            name="escritorio_id"
                                            value={data.escritorio_id}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('escritorio_id', e.target.value)}
                                        >
                                            <option value="">-- Bloquear todo el espacio --</option>
                                            {escritoriosLibres.map(escritorio => (
                                                <option key={escritorio.id} value={escritorio.id}>
                                                    {escritorio.nombre || escritorio.numero || `Escritorio #${escritorio.id}`}
                                                </option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.escritorio_id} className="mt-2" />
                                    </div>
                                )}
                                
                                {/* Tipo de bloqueo */}
                                <div>
                                    <InputLabel htmlFor="tipo_bloqueo" value="Tipo de Bloqueo" />
                                    <SelectInput
                                        id="tipo_bloqueo"
                                        className="mt-1 block w-full"
                                        value={data.tipo_bloqueo}
                                        onChange={e => setData('tipo_bloqueo', e.target.value)}
                                    >
                                        <option value="hora">Por Hora</option>
                                        <option value="medio_dia">Medio Día</option>
                                        <option value="dia_completo">Día Completo</option>
                                        <option value="semana">Semana</option>
                                        <option value="mes">Mes</option>
                                    </SelectInput>
                                    <InputError message={errors.tipo_bloqueo} className="mt-2" />
                                </div>

                                {/* Fecha de inicio */}
                                <div>
                                    <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                                    <TextInput
                                        id="fecha_inicio"
                                        type="date"
                                        name="fecha_inicio"
                                        value={data.fecha_inicio}
                                        className="mt-1 block w-full"
                                        onChange={e => setData('fecha_inicio', e.target.value)}
                                        min={todayFormatted}
                                    />
                                    <InputError message={errors.fecha_inicio} className="mt-2" />
                                    {fechaFinCalculada && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Fecha de finalización: {fechaFinCalculada}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Horarios, solo se muestra para bloqueos por hora o medio día */}
                                {showHoras && (
                                    <div className={`grid grid-cols-1 ${data.tipo_bloqueo === 'hora' ? 'md:grid-cols-2' : ''} gap-6`}>
                                        <div>
                                            <InputLabel htmlFor="hora_inicio" value="Hora de Inicio" />
                                            {data.tipo_bloqueo === 'medio_dia' ? (
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

                                        {data.tipo_bloqueo === 'hora' && (
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

                                {/* Fecha de fin (solo visible para bloqueos por hora) */}
                                {data.tipo_bloqueo === 'hora' && (
                                    <div>
                                        <InputLabel htmlFor="fecha_fin" value="Fecha de Fin" />
                                        <TextInput
                                            id="fecha_fin"
                                            type="date"
                                            name="fecha_fin"
                                            value={data.fecha_fin}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('fecha_fin', e.target.value)}
                                            min={data.fecha_inicio}
                                        />
                                        <InputError message={errors.fecha_fin} className="mt-2" />
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="motivo" value="Motivo del bloqueo" />
                                    <textarea
                                        id="motivo"
                                        name="motivo"
                                        value={data.motivo}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={e => setData('motivo', e.target.value)}
                                        rows={4}
                                    />
                                    <InputError message={errors.motivo} className="mt-2" />
                                </div>

                                <div className="flex justify-end">
                                    <PrimaryButton
                                        disabled={processing}
                                    >
                                        {isEditing ? 'Actualizar' : 'Crear'} Bloqueo
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                        
                        {/* Columna derecha: Visualización de disponibilidad */}
                        <div className="bg-dark p-6 rounded-lg shadow">
                            {selectedSpace ? (
                                <SpaceAvailability space={selectedSpace} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p className="text-center">Seleccione un espacio para visualizar su disponibilidad</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}