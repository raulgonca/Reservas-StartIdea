import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MediaManager from '@/Components/MediaManager';
import FeaturesSelector from '@/Components/FeatureSelector';

export default function EspacioForm({
    data,
    setData,
    errors,
    processing,
    tipos,
    onSubmit,
    onCancel,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    showImageUpload = false
}) {
    const [showEscritorios, setShowEscritorios] = useState(data.tipo === 'coworking');
    
    useEffect(() => {
        setShowEscritorios(data.tipo === 'coworking');
    }, [data.tipo]);

    // Handler para cambiar el tipo de espacio
    const handleTipoChange = (e) => {
        const tipo = e.target.value;
        setData('tipo', tipo);
        setShowEscritorios(tipo === 'coworking');

        // Si cambiamos a coworking y no hay escritorios, añadimos uno
        if (tipo === 'coworking' && (!data.escritorios || data.escritorios.length === 0)) {
            setData('escritorios', [{ numero: '1', is_active: true }]);
        }
    };

    // Manejadores para MediaManager
    const handleMainImageChange = (file) => {
        setData('image', file);
    };

    const handleGalleryImagesChange = (files) => {
        setData('gallery', files);
    };

    // Añadir un nuevo escritorio al espacio tipo coworking
    const addEscritorio = () => {
        const escritorios = data.escritorios || [];
        const newNumero = escritorios.length + 1;
        
        setData('escritorios', [
            ...escritorios, 
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

    // Actualizar características desde el selector
    const handleFeaturesChange = (features) => {
        setData('features', features);
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }} className="space-y-6">
            {/* Información básica */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Información Básica
                </h3>
                
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
                <div className="mt-4 space-y-2">
                    {/* Disponibilidad 24/7 */}
                    <div className="flex items-center">
                        <input
                            id="disponible_24_7"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={data.disponible_24_7 || false}
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
                            checked={data.is_active || false}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                            Espacio activo
                        </label>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Descripción
                </h3>

                <div>
                    <InputLabel htmlFor="descripcion" value="Descripción del espacio" />
                    <textarea
                        id="descripcion"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        rows="4"
                        value={data.descripcion || ''}
                        onChange={(e) => setData('descripcion', e.target.value)}
                    ></textarea>
                    <InputError message={errors.descripcion} className="mt-2" />
                </div>
            </div>

            {/* Características - Usamos FeaturesSelector */}
            <FeaturesSelector
                selectedFeatures={data.features || []}
                onChange={handleFeaturesChange}
                error={errors.features}
                title="Características"
            />

            {/* Imágenes - Usamos MediaManager */}
            {showImageUpload && (
                <MediaManager
                    mainImage={data.image || data.image_url || null}
                    galleryImages={data.gallery || data.gallery_urls || []}
                    onMainImageChange={handleMainImageChange}
                    onGalleryImagesChange={handleGalleryImagesChange}
                    mainImageError={errors.image}
                    galleryImagesError={errors.gallery}
                    mainImageRequired={!data.id} // Solo requerido para nuevos espacios
                />
            )}

            {/* Escritorios (solo para coworking) */}
            {showEscritorios && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
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

                    {data.escritorios && data.escritorios.length > 0 ? (
                        <div className="space-y-4">
                            {data.escritorios.map((escritorio, index) => (
                                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-md font-medium">Escritorio #{escritorio.id || index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeEscritorio(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <InputError message={errors[`escritorios.${index}.numero`]} className="mt-2" />
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
                            No hay escritorios configurados. Añade al menos uno para espacios de coworking.
                        </p>
                    )}
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-3">
                <SecondaryButton onClick={onCancel} type="button">
                    {cancelLabel}
                </SecondaryButton>
                <PrimaryButton disabled={processing} type="submit">
                    {processing ? 'Guardando...' : submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}