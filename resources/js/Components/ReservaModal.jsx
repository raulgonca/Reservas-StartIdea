import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ReservaModal({ reserva, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: reserva.user_id,
        espacio_id: reserva.espacio_id,
        fecha_inicio: reserva.fecha_inicio,
        fecha_fin: reserva.fecha_fin,
        motivo: reserva.motivo,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('reservas.update', reserva.id), {
            onSuccess: () => {
                toast.success('Reserva actualizada correctamente');
                onClose();
            },
            onError: () => {
                toast.error('Error al actualizar la reserva');
            }
        });
    };

    return (
        <Modal show={true} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">Actualizar Reserva</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="user_id" className="block text-gray-700">Usuario</label>
                    <input
                        type="text"
                        id="user_id"
                        value={data.user_id}
                        onChange={(e) => setData('user_id', e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                    {errors.user_id && <div className="text-red-500 mt-2">{errors.user_id}</div>}
                </div>
                <div className="mb-4">
                    <label htmlFor="espacio_id" className="block text-gray-700">Espacio</label>
                    <input
                        type="text"
                        id="espacio_id"
                        value={data.espacio_id}
                        onChange={(e) => setData('espacio_id', e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                    {errors.espacio_id && <div className="text-red-500 mt-2">{errors.espacio_id}</div>}
                </div>
                <div className="mb-4">
                    <label htmlFor="fecha_inicio" className="block text-gray-700">Fecha Inicio</label>
                    <input
                        type="date"
                        id="fecha_inicio"
                        value={data.fecha_inicio}
                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                    {errors.fecha_inicio && <div className="text-red-500 mt-2">{errors.fecha_inicio}</div>}
                </div>
                <div className="mb-4">
                    <label htmlFor="fecha_fin" className="block text-gray-700">Fecha Fin</label>
                    <input
                        type="date"
                        id="fecha_fin"
                        value={data.fecha_fin}
                        onChange={(e) => setData('fecha_fin', e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                    {errors.fecha_fin && <div className="text-red-500 mt-2">{errors.fecha_fin}</div>}
                </div>
                <div className="mb-4">
                    <label htmlFor="motivo" className="block text-gray-700">Motivo</label>
                    <textarea
                        id="motivo"
                        value={data.motivo}
                        onChange={(e) => setData('motivo', e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                    {errors.motivo && <div className="text-red-500 mt-2">{errors.motivo}</div>}
                </div>
                <div className="flex justify-end">
                    <SecondaryButton type="button" onClick={onClose} className="mr-2">Cancelar</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Actualizar</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}