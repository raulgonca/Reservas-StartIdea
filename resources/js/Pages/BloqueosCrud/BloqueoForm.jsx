import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
// Eliminamos la importación de TextArea que causa el error
import SelectInput from '@/Components/SelectInput';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';

export default function BloqueoForm({ bloqueo = null, espacios = [], escritorios = [], mode = 'create' }) {
    const { auth } = usePage().props;
    const isEditing = mode === 'edit';
    const title = isEditing ? 'Editar Bloqueo' : 'Crear Bloqueo';

    // Inicializar valores del formulario
    const { data, setData, post, put, errors, processing } = useForm({
        espacio_id: bloqueo?.espacio_id || '',
        escritorio_id: bloqueo?.escritorio_id || '',
        fecha_inicio: bloqueo?.fecha_inicio 
            ? format(new Date(bloqueo.fecha_inicio), "yyyy-MM-dd'T'HH:mm")
            : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        fecha_fin: bloqueo?.fecha_fin 
            ? format(new Date(bloqueo.fecha_fin), "yyyy-MM-dd'T'HH:mm")
            : format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"), // 1h después por defecto
        motivo: bloqueo?.motivo || '',
        creado_por: auth.user.id
    });

    // Manejar escritorios filtrados por espacio
    const [escritoriosFiltrados, setEscritoriosFiltrados] = useState([]);

    useEffect(() => {
        if (data.espacio_id) {
            const filtrados = escritorios.filter(
                escritorio => escritorio.espacio_id == data.espacio_id
            );
            setEscritoriosFiltrados(filtrados);
        } else {
            setEscritoriosFiltrados([]);
        }
    }, [data.espacio_id, escritorios]);

    // Reiniciar escritorio seleccionado si ya no corresponde al espacio seleccionado
    useEffect(() => {
        if (data.espacio_id && data.escritorio_id) {
            const escritorioEnEspacio = escritorios.some(
                e => e.id == data.escritorio_id && e.espacio_id == data.espacio_id
            );
            
            if (!escritorioEnEspacio) {
                setData('escritorio_id', '');
            }
        }
    }, [data.espacio_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const baseUrl = auth.user.role === 'superadmin' 
            ? '/v1/superadmin/bloqueos'
            : '/v1/admin/bloqueos';
            
        if (isEditing) {
            put(`${baseUrl}/${bloqueo.id}`);
        } else {
            post(baseUrl);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
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

                                {data.espacio_id && escritoriosFiltrados.length > 0 && (
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
                                            {escritoriosFiltrados.map(escritorio => (
                                                <option key={escritorio.id} value={escritorio.id}>
                                                    {escritorio.nombre}
                                                </option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.escritorio_id} className="mt-2" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="fecha_inicio" value="Fecha y hora de inicio" />
                                        <TextInput
                                            id="fecha_inicio"
                                            type="datetime-local"
                                            name="fecha_inicio"
                                            value={data.fecha_inicio}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('fecha_inicio', e.target.value)}
                                        />
                                        <InputError message={errors.fecha_inicio} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="fecha_fin" value="Fecha y hora de fin" />
                                        <TextInput
                                            id="fecha_fin"
                                            type="datetime-local"
                                            name="fecha_fin"
                                            value={data.fecha_fin}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('fecha_fin', e.target.value)}
                                        />
                                        <InputError message={errors.fecha_fin} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="motivo" value="Motivo del bloqueo" />
                                    {/* Reemplazamos el componente TextArea por un elemento textarea con clases de Tailwind */}
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

                                <div className="flex items-center justify-end">
                                    <PrimaryButton
                                        className="ml-4"
                                        disabled={processing}
                                    >
                                        {isEditing ? 'Actualizar' : 'Crear'} Bloqueo
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}