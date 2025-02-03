import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function EditReserva({ reserva }) {
    const { data, setData, patch, processing, errors } = useForm({
        user_id: reserva.user_id || '',
        espacio_id: reserva.espacio_id || '',
        escritorio_id: reserva.escritorio_id || '',
        fecha: reserva.fecha || '',
        hora_inicio: reserva.hora_inicio || '',
        hora_fin: reserva.hora_fin || '',
        tipo_reserva: reserva.tipo_reserva || 'hora',
        motivo: reserva.motivo || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('superadmin.reservas.update', reserva.id));
    };

    return (
        <>
            <Head title="Editar Reserva" />
            <div className="max-w-2xl mx-auto py-12">
                <h1 className="text-2xl font-bold mb-6">Editar Reserva</h1>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input
                            type="text"
                            value={data.user_id}
                            onChange={(e) => setData('user_id', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.user_id && <div className="text-red-600">{errors.user_id}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Espacio</label>
                        <input
                            type="text"
                            value={data.espacio_id}
                            onChange={(e) => setData('espacio_id', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.espacio_id && <div className="text-red-600">{errors.espacio_id}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Escritorio</label>
                        <input
                            type="text"
                            value={data.escritorio_id}
                            onChange={(e) => setData('escritorio_id', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.escritorio_id && <div className="text-red-600">{errors.escritorio_id}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input
                            type="date"
                            value={data.fecha}
                            onChange={(e) => setData('fecha', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.fecha && <div className="text-red-600">{errors.fecha}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                        <input
                            type="time"
                            value={data.hora_inicio}
                            onChange={(e) => setData('hora_inicio', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.hora_inicio && <div className="text-red-600">{errors.hora_inicio}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                        <input
                            type="time"
                            value={data.hora_fin}
                            onChange={(e) => setData('hora_fin', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.hora_fin && <div className="text-red-600">{errors.hora_fin}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Tipo de Reserva</label>
                        <select
                            value={data.tipo_reserva}
                            onChange={(e) => setData('tipo_reserva', e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="hora">Hora</option>
                            <option value="medio_dia">Medio Día</option>
                            <option value="dia_completo">Día Completo</option>
                            <option value="semana">Semana</option>
                            <option value="mes">Mes</option>
                        </select>
                        {errors.tipo_reserva && <div className="text-red-600">{errors.tipo_reserva}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Motivo</label>
                        <textarea
                            value={data.motivo}
                            onChange={(e) => setData('motivo', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.motivo && <div className="text-red-600">{errors.motivo}</div>}
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white" disabled={processing}>
                            Actualizar Reserva
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}