<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Application;

/**
 * Controlador para la gestión de espacios
 * 
 * @package App\Http\Controllers
 */
class EspacioController extends Controller
{
    /**
     * Muestra la lista de espacios activos en la página principal
     * 
     * @return \Inertia\Response Vista Welcome con los espacios y datos de la aplicación
     */
    public function index()
    {
        // Obtiene los espacios activos con los campos necesarios
        $espacios = Espacio::where('is_active', true)
            ->select(
                'id',
                'nombre',
                'slug',
                'descripcion',
                'image',
                'features',
                'aforo',
                'price',
                'tipo'
            )
            ->get()
            ->map(function ($espacio) {
                return [
                    'id' => $espacio->id,
                    'nombre' => $espacio->nombre,
                    'slug' => $espacio->slug,
                    'descripcion' => $espacio->descripcion,
                    'image_url' => $espacio->image_url,
                    'gallery_media' => $espacio->gallery_media,
                    'features' => json_decode($espacio->features, true) ?? [],
                    'aforo' => $espacio->aforo,
                    'price' => $espacio->price,
                    'tipo' => $espacio->tipo
                ];
            });

        return Inertia::render('Welcome', [
            'auth' => [
                'user' => Auth::check() ? Auth::user() : null
            ],
            'espacios' => $espacios,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    /**
     * Muestra los detalles de un espacio específico
     * 
     * @param string $slug El slug del espacio a mostrar
     * @return \Inertia\Response Vista Show con los detalles del espacio
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el espacio no existe
     */
    public function show($slug)
    {
        $espacio = Espacio::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Espacios/Show', [
            'espacio' => $espacio
        ]);
    }

    /**
     * Obtiene la disponibilidad de un espacio para una fecha específica
     * 
     * @param Request $request Contiene date y viewMode (day|week|month)
     * @param int $id ID del espacio
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailability(Request $request, $id)
    {
        try {
            $espacio = Espacio::findOrFail($id);
            $fecha = Carbon::parse($request->date);
            $viewMode = $request->viewMode ?? 'day';

            Log::info('Consultando disponibilidad', [
                'espacio_id' => $id,
                'fecha' => $fecha->toDateString(),
                'tipo_espacio' => $espacio->tipo,
                'viewMode' => $viewMode
            ]);

            switch ($viewMode) {
                case 'day':
                    return $this->getDayAvailability($espacio, $fecha);
                case 'week':
                    return $this->getWeekAvailability($espacio, $fecha);
                case 'month':
                    return $this->getMonthAvailability($espacio, $fecha);
                default:
                    return response()->json(['error' => 'Modo de vista no válido'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Error en getAvailability: ' . $e->getMessage(), [
                'espacio_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error al obtener disponibilidad'], 500);
        }
    }

    /**
     * Obtiene la disponibilidad diaria del espacio
     * 
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @return \Illuminate\Http\JsonResponse
     */
    private function getDayAvailability($espacio, $fecha)
    {
        if ($espacio->tipo === 'coworking') {
            return $this->getCoworkingAvailability($espacio, $fecha);
        }

        $slots = [];
        $horaInicio = Carbon::parse($espacio->horario_inicio);
        $horaFin = Carbon::parse($espacio->horario_fin);

        while ($horaInicio < $horaFin) {
            $slotOcupado = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $fecha)
                ->whereDate('fecha_fin', '>=', $fecha)
                ->whereTime('fecha_inicio', '<=', $horaInicio)
                ->whereTime('fecha_fin', '>', $horaInicio)
                ->whereIn('estado', ['confirmada', 'pendiente'])
                ->exists();

            $slots[] = [
                'time' => $horaInicio->format('H:i'),
                'isAvailable' => !$slotOcupado
            ];

            $horaInicio->addHour();
        }

        return response()->json(['slots' => $slots]);
    }

    /**
     * Obtiene la disponibilidad de escritorios para espacios coworking
     * 
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @return \Illuminate\Http\JsonResponse
     */
    private function getCoworkingAvailability($espacio, $fecha)
    {
        $escritorios = $espacio->escritorios()
            ->get()
            ->map(function($escritorio) use ($fecha) {
                $reservado = Reserva::where('escritorio_id', $escritorio->id)
                    ->where('espacio_id', $escritorio->espacio_id)
                    ->whereDate('fecha_inicio', '<=', $fecha)
                    ->whereDate('fecha_fin', '>=', $fecha)
                    ->whereIn('estado', ['confirmada', 'pendiente'])
                    ->exists();

                return [
                    'id' => $escritorio->id,
                    'numero' => $escritorio->numero,
                    'disponible' => !$reservado
                ];
            });

        return response()->json(['escritorios' => $escritorios]);
    }

    /**
     * Calcula el estado de ocupación de un día
     * 
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @param Carbon $day
     * @return string 'free'|'partial'|'occupied'
     */
    private function getOccupancyStatus($reservas, $day)
    {
        if ($reservas->isEmpty()) {
            return 'free';
        }

        $totalHours = 12; // Horario estándar 8:00 a 20:00
        $occupiedHours = 0;

        foreach ($reservas as $reserva) {
            $start = Carbon::parse($reserva->fecha_inicio)->setDate($day->year, $day->month, $day->day);
            $end = Carbon::parse($reserva->fecha_fin)->setDate($day->year, $day->month, $day->day);
            
            $hours = $end->diffInHours($start);
            $occupiedHours += $hours;
        }

        if ($occupiedHours >= $totalHours) {
            return 'occupied';
        }
        return 'partial';
    }

    /**
     * Obtiene la disponibilidad semanal del espacio
     * 
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @return \Illuminate\Http\JsonResponse
     */
    private function getWeekAvailability($espacio, $fecha)
    {
        $weekStart = $fecha->copy()->startOfWeek();
        $weekEnd = $fecha->copy()->endOfWeek();
        $weekAvailability = [];

        for ($day = $weekStart->copy(); $day <= $weekEnd; $day->addDay()) {
            $dayReservas = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $day)
                ->whereDate('fecha_fin', '>=', $day)
                ->whereIn('estado', ['confirmada', 'pendiente'])
                ->get();

            $weekAvailability[$day->format('Y-m-d')] = [
                'status' => $this->getOccupancyStatus($dayReservas, $day),
                'reservas' => $dayReservas->map(function($reserva) {
                    return [
                        'id' => $reserva->id,
                        'tipo_reserva' => $reserva->tipo_reserva,
                        'estado' => $reserva->estado,
                        'hora_inicio' => Carbon::parse($reserva->fecha_inicio)->format('H:i'),
                        'hora_fin' => Carbon::parse($reserva->fecha_fin)->format('H:i')
                    ];
                })
            ];
        }

        return response()->json(['weekAvailability' => $weekAvailability]);
    }

    /**
     * Obtiene la disponibilidad mensual del espacio
     * 
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @return \Illuminate\Http\JsonResponse
     */
    private function getMonthAvailability($espacio, $fecha)
    {
        $monthStart = $fecha->copy()->startOfMonth();
        $monthEnd = $fecha->copy()->endOfMonth();
        $monthAvailability = [];

        for ($day = $monthStart->copy(); $day <= $monthEnd; $day->addDay()) {
            $dayReservas = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $day)
                ->whereDate('fecha_fin', '>=', $day)
                ->whereIn('estado', ['confirmada', 'pendiente'])
                ->get();

            $monthAvailability[$day->format('Y-m-d')] = [
                'status' => $this->getOccupancyStatus($dayReservas, $day),
                'reservas' => $dayReservas->map(function($reserva) {
                    return [
                        'id' => $reserva->id,
                        'tipo_reserva' => $reserva->tipo_reserva,
                        'estado' => $reserva->estado,
                        'hora_inicio' => Carbon::parse($reserva->fecha_inicio)->format('H:i'),
                        'hora_fin' => Carbon::parse($reserva->fecha_fin)->format('H:i')
                    ];
                })
            ];
        }

        return response()->json(['monthAvailability' => $monthAvailability]);
    }
}