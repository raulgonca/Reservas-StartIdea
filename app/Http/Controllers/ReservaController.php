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
    // Validar los datos de la solicitud
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

    Log::info('Datos de la solicitud validados', $request->all());

    // Normalizar las fechas y horas de inicio y fin
    $fechaInicio = $request->fecha_inicio . ' ' . ($request->hora_inicio ?? '00:00:00');
    $fechaFin = $request->fecha_fin ? $request->fecha_fin . ' ' . ($request->hora_fin ?? '23:59:59') : $fechaInicio;

    // Validar que no haya solapamientos con otras reservas
    $solapamiento = Reserva::where('espacio_id', $request->espacio_id)
        ->where(function ($query) use ($fechaInicio, $fechaFin) {
            $query->where('fecha_inicio', '<', $fechaFin)
                  ->where('fecha_fin', '>', $fechaInicio);
        })
        ->when($request->escritorio_id, function ($query) use ($request) {
            $query->where('escritorio_id', $request->escritorio_id);
        })
        ->first();

    Log::info('Resultado de la validación de solapamiento', ['solapamiento' => $solapamiento]);

    if ($solapamiento) {
        $mensajeError = "El horario solicitado ya está reservado desde {$solapamiento->fecha_inicio} hasta {$solapamiento->fecha_fin}.";
        Log::error('Solapamiento detectado', ['mensajeError' => $mensajeError]);
        return back()->withErrors(['error' => $mensajeError]);
    }

    // Crear la reserva con estado confirmada
    Reserva::create(array_merge($request->all(), ['estado' => 'confirmada']));

    Log::info('Reserva creada exitosamente');

    return back()->with('success', 'Reserva creada exitosamente.');
}
}