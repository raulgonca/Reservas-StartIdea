import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';

export default function EspacioModal({ espacio, isOpen, onClose, tipos }) {
    const [showEscritorios, setShowEscritorios] = useState(espacio?.tipo === 'coworking');
    
    const { data, setData, put, processing, errors, reset } = useForm({
        nombre: espacio?.nombre || '',
        tipo: espacio?.tipo || 'sala',
        aforo: espacio?.aforo || '',
        price: espacio?.price || '',
        descripcion: espacio?.descripcion || '',
        is_active: espacio?.is_active || true,
        horario_inicio: espacio?.horario_inicio || '08:00',
        horario_fin: espacio?.horario_fin || '20:00',
        disponible_24_7: espacio?.disponible_24_7 || false,
        escritorios: espacio?.escritorios || []
    });

    // Actualizar el formulario cuando cambia el espacio seleccionado
    useEffect(() => {
        if (espacio) {
            setData({
                nombre: espacio.nombre || '',
                tipo: espacio.tipo || 'sala',
                aforo: espacio.aforo || '',
                price: espacio.price || '',
                descripcion: espacio.descripcion || '',
                is_active: espacio.is_active || true,
                horario_inicio: espacio.horario_inicio || '08:00',
                horario_fin: espacio.horario_fin || '20:00',
                disponible_24_7: espacio.disponible_24_7 || false,
                escritorios: espacio.escritorios || []
            });
            setShowEscritorios(espacio.tipo === 'coworking');
        }
    }, [espacio]);

    const handleTipoChange = (e) => {
        const tipo = e.target.value;
        setData('tipo', tipo);
        setShowEscritorios(tipo === 'coworking');

        // Si cambiamos a coworking y no hay escritorios, añadimos uno
        if (tipo === 'coworking' && (!data.escritorios || data.escritorios.length === 0)) {
            setData('escritorios', [{ numero: '1', is_active: true }]);
        }
    };

    // Añadir un nuevo escritorio
    const addEscritorio = () => {
        const newNumero = data.escritorios.length + 1;
        setData('escritorios', [
            ...data.escritorios, 
            { numero: newNumero.toString(), is_active: true }
        ]);
    };

    // Eliminar un escritorio
    const removeEscritorio = (index) => {
        const newEscritorios = [...data.escritorios];
        newEscritorios.splice(index, 1);
        setData('escritorios', newEscritorios);
    };

    // Actualizar datos de un escritorio
    const updateEscritorio = (index, field, value) => {
        const newEscritorios = [...data.escritorios];
        newEscritorios[index][field] = value;
        setData('escritorios', newEscritorios);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!espacio?.id) return;
        
        put(route(`admin.espacios.update`, espacio.id), {
            onBefore: () => {
                toast.info("Actualizando espacio...", {
                    autoClose: false,
                    toastId: "updating-espacio"
                });
                return true;
            },
            onSuccess: () => {
                toast.dismiss("updating-espacio");
                toast.success("Espacio actualizado correctamente");
                onClose();
            },
            onError: (errors) => {
                toast.dismiss("updating-espacio");
                toast.error("Hay errores en el formulario, revisa los campos");
                console.error(errors);
            }
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Editar Espacio
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput
                                id="nombre"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                required
                            />
                            <InputError message={errors.nombre} className="mt-2" />
                        </div>

                        {/* Tipo */}
                        <div>
                            <InputLabel htmlFor="tipo" value="Tipo de Espacio" />
                            <select
                                id="tipo"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={data.tipo}
                                onChange={handleTipoChange}
                                required
                            >
                                {tipos.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.tipo} className="mt-2" />
                        </div>

                        {/* Aforo */}
                        <div>
                            <InputLabel htmlFor="aforo" value="Aforo" />
                            <TextInput
                                id="aforo"
                                type="number"
                                min="1"
                                className="mt-1 block w-full"
                                value={data.aforo}
                                onChange={(e) => setData('aforo', e.target.value)}
                            />
                            <InputError message={errors.aforo} className="mt-2" />
                        </div>

                        {/* Precio */}
                        <div>
                            <InputLabel htmlFor="price" value="Precio" />
                            <TextInput
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                required
                            />
                            <InputError message={errors.price} className="mt-2" />
                        </div>

                        {/* Horario inicio */}
                        <div>
                            <InputLabel htmlFor="horario_inicio" value="Horario de inicio" />
                            <TextInput
                                id="horario_inicio"
                                type="time"
                                className="mt-1 block w-full"
                                value={data.horario_inicio}
                                onChange={(e) => setData('horario_inicio', e.target.value)}
                            />
                            <InputError message={errors.horario_inicio} className="mt-2" />
                        </div>

                        {/* Horario fin */}
                        <div>
                            <InputLabel htmlFor="horario_fin" value="Horario de fin" />
                            <TextInput
                                id="horario_fin"
                                type="time"
                                className="mt-1 block w-full"
                                value={data.horario_fin}
                                onChange={(e) => setData('horario_fin', e.target.value)}
                            />
                            <InputError message={errors.horario_fin} className="mt-2" />
                        </div>
                    </div>

                    {/* Opciones adicionales */}
                    <div className="space-y-2">
                        {/* Disponibilidad 24/7 */}
                        <div className="flex items-center">
                            <input
                                id="disponible_24_7"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={data.disponible_24_7}
                                onChange={(e) => setData('disponible_24_7', e.target.checked)}
                            />
                            <label htmlFor="disponible_24_7" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                Disponible 24/7
                            </label>
                        </div>

                        {/* Estado activo */}
                        <div className="flex items-center">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                Espacio activo
                            </label>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <InputLabel htmlFor="descripcion" value="Descripción del espacio" />
                        <textarea
                            id="descripcion"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            rows="3"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        ></textarea>
                        <InputError message={errors.descripcion} className="mt-2" />
                    </div>

                    {/* Escritorios (solo para coworking) */}
                    {showEscritorios && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                                    Escritorios
                                </h3>
                                <button
                                    type="button"
                                    onClick={addEscritorio}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                >
                                    + Añadir Escritorio
                                </button>
                            </div>

                            <InputError message={errors.escritorios} className="mt-2" />

                            {data.escritorios?.length > 0 ? (
                                <div className="space-y-4">
                                    {data.escritorios.map((escritorio, index) => (
                                        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-medium">Escritorio #{escritorio.id || index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEscritorio(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <InputLabel htmlFor={`escritorio-${index}-numero`} value="Número/Nombre" />
                                                    <TextInput
                                                        id={`escritorio-${index}-numero`}
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={escritorio.numero}
                                                        onChange={(e) => updateEscritorio(index, 'numero', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        id={`escritorio-${index}-active`}
                                                        type="checkbox"
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        checked={escritorio.is_active}
                                                        onChange={(e) => updateEscritorio(index, 'is_active', e.target.checked)}
                                                    />
                                                    <label htmlFor={`escritorio-${index}-active`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                        Escritorio activo
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                                    No hay escritorios configurados.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <SecondaryButton onClick={onClose} type="button">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}