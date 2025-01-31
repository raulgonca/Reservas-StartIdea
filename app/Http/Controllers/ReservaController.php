<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Bloqueo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservaController extends Controller
{
    public function index()
    {
        $reservas = Reserva::all();
        return Inertia::render('Reservas/Index', [
            'reservas' => $reservas,
        ]);
    }

    public function show($id)
    {
        $reserva = Reserva::findOrFail($id);
        return Inertia::render('Reservas/Show', [
            'reserva' => $reserva,
        ]);
    }

    public function create()
    {
        return Inertia::render('Reservas/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
            'motivo' => 'nullable|string',
        ]);

        // Validar que no haya solapamientos con otras reservas
        $solapamiento = Reserva::where('espacio_id', $request->espacio_id)
            ->where('fecha', $request->fecha)
            ->where(function ($query) use ($request) {
                $query->whereBetween('hora_inicio', [$request->hora_inicio, $request->hora_fin])
                    ->orWhereBetween('hora_fin', [$request->hora_inicio, $request->hora_fin]);
            })
            ->exists();

        if ($solapamiento) {
            return back()->withErrors(['error' => 'El horario solicitado ya está reservado.']);
        }

        // Validar que no haya bloqueos en el horario solicitado
        $bloqueo = Bloqueo::where('espacio_id', $request->espacio_id)
            ->where('fecha', $request->fecha)
            ->where(function ($query) use ($request) {
                $query->whereBetween('hora_inicio', [$request->hora_inicio, $request->hora_fin])
                    ->orWhereBetween('hora_fin', [$request->hora_inicio, $request->hora_fin]);
            })
            ->exists();

        if ($bloqueo) {
            return back()->withErrors(['error' => 'El horario solicitado está bloqueado.']);
        }

        Reserva::create($request->all());

        return redirect()->route('v1.reservas.index')->with('success', 'Reserva creada exitosamente.');
    }
}