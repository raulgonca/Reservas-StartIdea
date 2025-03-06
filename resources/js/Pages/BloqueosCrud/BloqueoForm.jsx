import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import SpaceAvailability from '@/Components/SpaceAvailability';
import { Head } from '@inertiajs/react';
import { format, addDays, addMonths } from 'date-fns';
import { toast } from 'react-toastify';

export default function BloqueoForm({ bloqueo = null, espacios = [], escritorios = [], mode = 'create' }) {
    const { auth, flash, errors } = usePage().props;
    const isEditing = mode === 'edit';
    
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayFormatted = format(today, 'yyyy-MM-dd');
    const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');
    
    // Estado para determinar si se calculó automáticamente la fecha de fin
    const [fechaFinCalculada, setFechaFinCalculada] = useState('');
    const [showHoras, setShowHoras] = useState(true);
    
    // Inicializar valores del formulario
    const { data, setData, post, put, processing } = useForm({
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
        
        if (difDias === 0) {
            if ((horaInicio === 8 && horaFin === 14) || (horaInicio === 14 && horaFin === 20)) {
                return 'medio_dia';
            }
            if (horaInicio === 0 && horaFin === 23) {
                return 'dia_completo';
            }
            return 'hora';
        }
        
        if (difDias >= 28 && difDias <= 31) return 'mes';
        if (difDias === 7) return 'semana';
        if (difDias === 1 && horaInicio === 0 && horaFin === 23) return 'dia_completo';
        
        return 'hora';
    }

    // Estados para manejar la visibilidad y disponibilidad de escritorios
    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);

    // Efecto para manejar la visibilidad de escritorios
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

    // Manejo del envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const fechaInicioCompleta = `${data.fecha_inicio}T${data.hora_inicio}`;
        const fechaFinCompleta = `${data.fecha_fin}T${data.hora_fin}`;
        
        const inicio = new Date(fechaInicioCompleta);
        const fin = new Date(fechaFinCompleta);
        
        if (fin <= inicio) {
            toast.error('La fecha y hora de fin debe ser posterior a la fecha y hora de inicio');
            return;
        }
        
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
            put(`${baseUrl}/${bloqueo.id}`, formData);
        } else {
            post(baseUrl, formData);
        }
    };

    return (
        <div className="py-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">{isEditing ? 'Editar Bloqueo' : 'Crear Bloqueo'}</h2>
            
            {/* Layout de dos columnas para pantallas medianas y grandes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna izquierda: Formulario */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="espacio_id" value="Espacio" className="text-gray-700 dark:text-gray-300" />
                            <SelectInput
                                id="espacio_id"
                                name="espacio_id"
                                value={data.espacio_id}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
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
                                <InputLabel htmlFor="escritorio_id" value="Escritorio (Opcional)" className="text-gray-700 dark:text-gray-300" />
                                <SelectInput
                                    id="escritorio_id"
                                    name="escritorio_id"
                                    value={data.escritorio_id}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
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
                        
                        <div>
                            <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" className="text-gray-700 dark:text-gray-300" />
                            <TextInput
                                id="fecha_inicio"
                                type="date"
                                name="fecha_inicio"
                                value={data.fecha_inicio}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                onChange={e => setData('fecha_inicio', e.target.value)}
                                min={todayFormatted}
                            />
                            <InputError message={errors.fecha_inicio} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="fecha_fin" value="Fecha de Fin" className="text-gray-700 dark:text-gray-300" />
                            <TextInput
                                id="fecha_fin"
                                type="date"
                                name="fecha_fin"
                                value={data.fecha_fin}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                onChange={e => setData('fecha_fin', e.target.value)}
                                min={data.fecha_inicio}
                            />
                            <InputError message={errors.fecha_fin} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="hora_inicio" value="Hora de Inicio" className="text-gray-700 dark:text-gray-300" />
                                <TextInput
                                    id="hora_inicio"
                                    type="time"
                                    name="hora_inicio"
                                    value={data.hora_inicio}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    onChange={e => setData('hora_inicio', e.target.value)}
                                />
                                <InputError message={errors.hora_inicio} className="mt-2" />
                            </div>
                            
                            <div>
                                <InputLabel htmlFor="hora_fin" value="Hora de Fin" className="text-gray-700 dark:text-gray-300" />
                                <TextInput
                                    id="hora_fin"
                                    type="time"
                                    name="hora_fin"
                                    value={data.hora_fin}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    onChange={e => setData('hora_fin', e.target.value)}
                                />
                                <InputError message={errors.hora_fin} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="motivo" value="Motivo del bloqueo" className="text-gray-700 dark:text-gray-300" />
                            <textarea
                                id="motivo"
                                name="motivo"
                                value={data.motivo}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                onChange={e => setData('motivo', e.target.value)}
                                rows={4}
                            ></textarea>
                            <InputError message={errors.motivo} className="mt-2" />
                        </div>

                        <div className="flex justify-end pt-4">
                            <PrimaryButton
                                className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700"
                                disabled={processing}
                            >
                                {isEditing ? 'Actualizar' : 'Crear'} Bloqueo
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
    );
}