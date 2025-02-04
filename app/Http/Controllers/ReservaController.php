<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Bloqueo;
use App\Models\User;
use App\Models\Espacio;
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
        $users = User::all();
        $espacios = Espacio::all();
        $reservas = Reserva::all();

        dd($users, $espacios, $reservas);


        return Inertia::render('ReservasCrud/CreateReserva', [
            'users' => $users,
            'espacios' => $espacios,
            'reservas' => $reservas,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
            'motivo' => 'nullable|string',
        ]);

        // Validar que no haya solapamientos con otras reservas
        $solapamiento = Reserva::where('espacio_id', $request->espacio_id)
            ->whereBetween('fecha_inicio', [$request->fecha_inicio, $request->fecha_fin])
            ->orWhereBetween('fecha_fin', [$request->fecha_inicio, $request->fecha_fin])
            ->exists();

        if ($solapamiento) {
            return back()->withErrors(['error' => 'El horario solicitado ya está reservado.']);
        }

        // Validar que no haya bloqueos en el horario solicitado
        $bloqueo = Bloqueo::where('espacio_id', $request->espacio_id)
            ->whereBetween('fecha_inicio', [$request->fecha_inicio, $request->fecha_fin])
            ->orWhereBetween('fecha_fin', [$request->fecha_inicio, $request->fecha_fin])
            ->exists();

        if ($bloqueo) {
            return back()->withErrors(['error' => 'El horario solicitado está bloqueado.']);
        }

        Reserva::create($request->all());

        return redirect()->route('v1.reservas.index')->with('success', 'Reserva creada exitosamente.');
    }
}
