<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Bloqueo;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ReservaController extends Controller
{
    public function index()
    {
        $reservas = Reserva::with(['user', 'espacio', 'escritorio'])->get();
        return Inertia::render('ReservasCrud/ReservasList', [
            'reservas' => $reservas,
        ]);
    }

    public function create()
    {
        $users = User::all();
        $espacios = Espacio::all();
        $reservas = Reserva::all();
        $escritorios = Escritorio::all(); // Obtener todos los escritorios

        // Enviar los datos a Inertia
        return Inertia::render('ReservasCrud/CreateReserva', [
            'users' => $users,
            'espacios' => $espacios,
            'reservas' => $reservas,
            'escritorios' => $escritorios,
        ]);
    }

    public function store(Request $request)
{
    // Log de depuración: datos recibidos
    Log::info('Datos recibidos en el método store:', $request->all());

    $request->validate([
        'user_id' => 'required|exists:users,id',
        'espacio_id' => 'required|exists:espacios,id',
        'escritorio_id' => 'nullable|exists:escritorios,id',
        'fecha_inicio' => 'required|date|after_or_equal:today',
        'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        'hora_inicio' => 'nullable|date_format:H:i',
        'hora_fin' => 'nullable|date_format:H:i|after:hora_inicio',
        'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
        'motivo' => 'nullable|string',
    ]);

    // Validar que no haya solapamientos con otras reservas
    $solapamiento = Reserva::where('espacio_id', $request->espacio_id)
        ->where(function ($query) use ($request) {
            $query->where(function ($query) use ($request) {
                $query->where('fecha_inicio', '<=', $request->fecha_fin ?? $request->fecha_inicio)
                      ->where('fecha_fin', '>=', $request->fecha_inicio);
            });
        })
        ->exists();

    if ($solapamiento) {
        Log::warning('Solapamiento detectado.');
        return back()->withErrors(['error' => 'El horario solicitado ya está reservado.']);
    }

    // Validar que no haya bloqueos en el horario solicitado
    $bloqueo = Bloqueo::where('espacio_id', $request->espacio_id)
        ->where(function ($query) use ($request) {
            $query->where(function ($query) use ($request) {
                $query->where('fecha_inicio', '<=', $request->fecha_fin ?? $request->fecha_inicio)
                      ->where('fecha_fin', '>=', $request->fecha_inicio);
            });
        })
        ->exists();

    if ($bloqueo) {
        Log::warning('Bloqueo detectado.');
        return back()->withErrors(['error' => 'El horario solicitado está bloqueado.']);
    }

    // Log de depuración: antes de crear la reserva
    Log::info('Creando la reserva.');

    // Crear la reserva con estado confirmada
    Reserva::create(array_merge($request->all(), ['estado' => 'confirmada']));

    // Log de depuración: reserva creada
    Log::info('Reserva creada exitosamente.');

    return back()->with('success', 'Reserva creada exitosamente.');
}
}