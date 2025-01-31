<?php

namespace App\Http\Controllers;

use App\Models\ReservaRecurrente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservaRecurrenteController extends Controller
{
    public function index()
    {
        $reservasRecurrentes = ReservaRecurrente::all();
        return Inertia::render('ReservasRecurrentes/Index', [
            'reservasRecurrentes' => $reservasRecurrentes,
        ]);
    }

    public function show($id)
    {
        $reservaRecurrente = ReservaRecurrente::findOrFail($id);
        return Inertia::render('ReservasRecurrentes/Show', [
            'reservaRecurrente' => $reservaRecurrente,
        ]);
    }

    public function create()
    {
        return Inertia::render('ReservasRecurrentes/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
            'frecuencia' => 'required|in:diaria,semanal,mensual',
            'dias_semana' => 'nullable|string',
            'motivo' => 'nullable|string',
        ]);

        ReservaRecurrente::create($request->all());

        return redirect()->route('v1.reservas_recurrentes.index')->with('success', 'Reserva recurrente creada exitosamente.');
    }
}