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
    
        // Validar que no haya solapamientos con otras reservas
        $solapamiento = Reserva::where('espacio_id', $request->espacio_id)
            ->where(function ($query) use ($request) {
                switch ($request->tipo_reserva) {
                    case 'hora':
                        $query->where(function ($query) use ($request) {
                            $query->where('fecha_inicio', $request->fecha_inicio)
                                ->where('hora_inicio', '<', $request->hora_fin)
                                ->where('hora_fin', '>', $request->hora_inicio);
                        });
                        break;
                    case 'medio_dia':
                        $query->where(function ($query) use ($request) {
                            $query->where('fecha_inicio', $request->fecha_inicio)
                                ->where(function ($query) use ($request) {
                                    $query->where('hora_inicio', '<', $request->hora_fin)
                                        ->where('hora_fin', '>', $request->hora_inicio);
                                });
                        });
                        break;
                    case 'dia_completo':
                        $query->where('fecha_inicio', $request->fecha_inicio);
                        break;
                    case 'semana':
                        $query->where('fecha_inicio', '<=', $request->fecha_fin)
                            ->where('fecha_fin', '>=', $request->fecha_inicio);
                        break;
                    case 'mes':
                        $query->where('fecha_inicio', '<=', $request->fecha_fin)
                            ->where('fecha_fin', '>=', $request->fecha_inicio);
                        break;
                }
            })
            ->when($request->escritorio_id, function ($query) use ($request) {
                $query->where('escritorio_id', $request->escritorio_id);
            })
            ->first();
    
        Log::info('Resultado de la validación de solapamiento', ['solapamiento' => $solapamiento]);
    
        if ($solapamiento) {
            $mensajeError = "El horario solicitado ya está reservado";
            if ($solapamiento->tipo_reserva === 'dia_completo') {
                $mensajeError .= " el día {$solapamiento->fecha_inicio}.";
            } else {
                $mensajeError .= " desde {$solapamiento->hora_inicio} hasta {$solapamiento->hora_fin} el día {$solapamiento->fecha_inicio}.";
            }
            Log::error('Solapamiento detectado', ['mensajeError' => $mensajeError]);
            return back()->withErrors(['error' => $mensajeError]);
        }
    
        // Crear la reserva con estado confirmada
        Reserva::create(array_merge($request->all(), ['estado' => 'confirmada']));
    
        Log::info('Reserva creada exitosamente');
    
        return back()->with('success', 'Reserva creada exitosamente.');
    }
}