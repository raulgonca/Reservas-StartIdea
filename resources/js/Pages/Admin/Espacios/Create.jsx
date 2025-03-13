import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react'; // Importaciones correctas
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'react-toastify';
import EspacioForm from '@/Components/EspacioForm';

export default function Create({ tipos, routePrefix }) {
    const { auth } = usePage().props;
    const [imagePreview, setImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [showEscritorios, setShowEscritorios] = useState(false);

    // Usar el routePrefix de las props o del usuario si está disponible
    const prefix = routePrefix || (auth.user?.role === 'admin' ? 'admin' : 'superadmin');

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        tipo: tipos[0] || 'sala', // Usar el primer tipo de la lista o 'sala' por defecto
        aforo: '',
        disponible_24_7: false,
        horario_inicio: '08:00',
        horario_fin: '20:00',
        descripcion: '',
        features: [],
        price: '',
        image: null,
        gallery: [],
        is_active: true,
        escritorios: []
    });

    // Handler para cambiar el tipo de espacio
    const handleTipoChange = (e) => {
        const tipo = e.target.value;
        setData('tipo', tipo);
        setShowEscritorios(tipo === 'coworking');

        // Si cambiamos a coworking, añadimos al menos un escritorio
        if (tipo === 'coworking' && data.escritorios.length === 0) {
            setData('escritorios', [{ numero: '1', is_active: true }]);
        }
    };

    // Handler para las características (features)
    const handleFeaturesChange = (features) => {
        setData('features', features);
    };

    // Handler para imagen principal
    const handleMainImageChange = (image) => {
        setData('image', image);
    };

    // Handler para galería de imágenes
    const handleGalleryImagesChange = (images) => {
        setData('gallery', images);
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

    // Enviar el formulario
    const handleSubmit = (e) => {
        // Verificar si existe el evento antes de usarlo
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        post(route(`${prefix}.espacios.store`), {
            onSuccess: () => {
                toast.success('Espacio creado correctamente');
                reset();
            },
            onError: (errors) => {
                toast.error('Ha ocurrido un error al crear el espacio');
                console.error(errors);
            }
        });
    };

    // Cancelar y volver al listado
    const handleCancel = () => {
        router.get(route(`${prefix}.espacios.index`));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Crear Espacio</h2>}
        >
            <Head title="Crear Espacio" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <EspacioForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                tipos={tipos}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                showImageUpload={true}
                                submitLabel="Crear Espacio"
                                cancelLabel="Cancelar"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}