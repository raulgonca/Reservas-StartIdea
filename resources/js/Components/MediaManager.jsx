import React, { useState, useRef } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay 
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente para cada elemento arrastrable de la galería
function SortableGalleryItem({ preview, index, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: `image-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };
    
    const isVideo = typeof preview === 'string' && preview.includes('video');

    return (
        <div 
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="relative group"
        >
            <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing w-full h-24"
            >
                {isVideo ? (
                    <video 
                        src={preview} 
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                ) : (
                    <img
                        src={preview}
                        alt={`Galería ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                )}
            </div>
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
                ×
            </button>
            <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs rounded px-1">
                {index + 1}
            </div>
        </div>
    );
}

export default function MediaManager({
    mainImage,
    galleryImages = [],
    onMainImageChange,
    onGalleryImagesChange,
    mainImageError,
    galleryImagesError,
    mainImageRequired = true,
    allowVideo = false,
    title = "Imágenes"
}) {
    const [mainPreview, setMainPreview] = useState(typeof mainImage === 'string' ? mainImage : null);
    const [galleryPreviews, setGalleryPreviews] = useState(
        galleryImages.filter(img => typeof img === 'string')
    );
    const mainImageInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const [activeId, setActiveId] = useState(null);
    
    // Configurar los sensores para drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    // Handler para manejar el cambio de imagen principal
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
        if (!file.type.match('image.*') && !allowVideo) {
            alert('Por favor, selecciona un archivo de imagen válido.');
            return;
        }
        
        onMainImageChange(file);
        
        // Crear vista previa
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            setMainPreview(URL.createObjectURL(file));
        }
    };

    // Handler para manejar el cambio de galería
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        // Filtrar archivos no válidos
        const validFiles = files.filter(file => {
            if (file.type.match('image.*') || (allowVideo && file.type.match('video.*'))) {
                return true;
            }
            return false;
        });
        
        if (validFiles.length !== files.length) {
            alert('Algunos archivos no son válidos y han sido ignorados.');
        }
        
        onGalleryImagesChange(validFiles);
        
        // Crear vistas previas
        const createPreviews = validFiles.map(file => {
            return new Promise(resolve => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({ type: 'image', src: reader.result });
                    };
                    reader.readAsDataURL(file);
                } else if (file.type.startsWith('video/')) {
                    resolve({ type: 'video', src: URL.createObjectURL(file) });
                }
            });
        });
        
        Promise.all(createPreviews).then(newPreviews => {
            setGalleryPreviews([...galleryPreviews, ...newPreviews.map(p => p.src)]);
        });
    };

    // Eliminar una imagen de la galería
    const removeGalleryImage = (index) => {
        const newGallery = [...galleryImages];
        newGallery.splice(index, 1);
        onGalleryImagesChange(newGallery);
        
        const newPreviews = [...galleryPreviews];
        newPreviews.splice(index, 1);
        setGalleryPreviews(newPreviews);
    };

    // Reordenar imágenes de la galería mediante drag & drop
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = Number(active.id.split('-')[1]);
            const newIndex = Number(over.id.split('-')[1]);
            
            // Actualizar previsualizaciones
            setGalleryPreviews(prevPreviews => 
                arrayMove(prevPreviews, oldIndex, newIndex)
            );
            
            // Actualizar archivos reales
            const newGallery = arrayMove([...galleryImages], oldIndex, newIndex);
            onGalleryImagesChange(newGallery);
        }
        
        setActiveId(null);
    };

    // Limpiar imagen principal
    const clearMainImage = () => {
        onMainImageChange(null);
        setMainPreview(null);
        if (mainImageInputRef.current) {
            mainImageInputRef.current.value = '';
        }
    };

    // Limpiar galería
    const clearGallery = () => {
        onGalleryImagesChange([]);
        setGalleryPreviews([]);
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {title}
            </h3>

            {/* Imagen principal */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                    <InputLabel htmlFor="main-image" value={`Imagen principal${mainImageRequired ? ' (obligatoria)' : ''}`} />
                    {mainPreview && (
                        <button
                            type="button"
                            onClick={clearMainImage}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Borrar imagen
                        </button>
                    )}
                </div>
                <input
                    id="main-image"
                    ref={mainImageInputRef}
                    type="file"
                    accept={allowVideo ? "image/*,video/*" : "image/*"}
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        dark:file:bg-indigo-900 dark:file:text-indigo-300
                        hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    onChange={handleMainImageChange}
                    required={mainImageRequired && !mainPreview}
                />
                <InputError message={mainImageError} className="mt-2" />
                
                {mainPreview && (
                    <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Imagen principal:</p>
                        <div className="relative w-full max-w-md">
                            {typeof mainPreview === 'string' && mainPreview.includes('video') ? (
                                <video 
                                    src={mainPreview} 
                                    controls 
                                    className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                            ) : (
                                <img
                                    src={mainPreview}
                                    alt="Vista previa"
                                    className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Galería */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <InputLabel htmlFor="gallery" value="Galería de imágenes (opcional)" />
                    {galleryPreviews.length > 0 && (
                        <button
                            type="button"
                            onClick={clearGallery}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Borrar galería
                        </button>
                    )}
                </div>
                <input
                    id="gallery"
                    ref={galleryInputRef}
                    type="file"
                    accept={allowVideo ? "image/*,video/*" : "image/*"}
                    multiple
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        dark:file:bg-indigo-900 dark:file:text-indigo-300
                        hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    onChange={handleGalleryChange}
                />
                <InputError message={galleryImagesError} className="mt-2" />
                
                {galleryPreviews.length > 0 && (
                    <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Galería ({galleryPreviews.length} {galleryPreviews.length === 1 ? 'imagen' : 'imágenes'}):
                            {galleryPreviews.length > 1 && ' (Arrastra para reordenar)'}
                        </p>
                        
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={galleryPreviews.map((_, index) => `image-${index}`)}
                                strategy={horizontalListSortingStrategy}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {galleryPreviews.map((preview, index) => (
                                        <SortableGalleryItem
                                            key={`image-${index}`}
                                            preview={preview}
                                            index={index}
                                            onRemove={removeGalleryImage}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            
                            <DragOverlay>
                                {activeId ? (
                                    <div className="relative opacity-50">
                                        <img
                                            src={galleryPreviews[Number(activeId.split('-')[1])]}
                                            alt="Arrastrable"
                                            className="w-full h-24 object-cover rounded-lg border-2 border-dashed border-indigo-400"
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                )}
            </div>
        </div>
    );
}