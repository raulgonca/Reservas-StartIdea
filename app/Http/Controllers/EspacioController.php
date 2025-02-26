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
use Illuminate\Http\JsonResponse;

/**
 * Controlador para la gestión de espacios y su disponibilidad
 */
class EspacioController extends Controller
{
    // Constantes para horarios
    private const HORA_INICIO = '08:00';
    private const HORA_FIN = '20:00';
    private const INTERVALO_MINUTOS = 60;

    // Constantes para estados de disponibilidad
    private const STATUS_FREE = 'free';
    private const STATUS_PARTIAL = 'partial';
    private const STATUS_OCCUPIED = 'occupied';

    /**
     * Muestra la lista de espacios activos en la página principal
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $espacios = Espacio::where('is_active', true)
            ->select('id', 'nombre', 'slug', 'descripcion', 'image', 'features', 'aforo', 'price', 'tipo')
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
            'auth' => ['user' => Auth::check() ? Auth::user() : null],
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
     * @param string $slug
     * @return \Inertia\Response
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
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function getAvailability(Request $request, $id): JsonResponse
    {
        try {
            $espacio = Espacio::findOrFail($id);
            $fecha = Carbon::parse($request->fecha);
            $vista = $request->vista ?? 'day';
            $escritorio_id = $request->escritorio;

            Log::info('Consultando disponibilidad', [
                'espacio_id' => $id,
                'fecha' => $fecha->toDateString(),
                'tipo_espacio' => $espacio->tipo,
                'vista' => $vista,
                'escritorio_id' => $escritorio_id
            ]);

            switch ($vista) {
                case 'week':
                    return $this->getWeekAvailability($espacio, $fecha, $escritorio_id);        
                case 'month':
                    return $this->getMonthAvailability($espacio, $fecha, $escritorio_id);       
                default:
                    return $this->getDayAvailability($espacio, $fecha, $escritorio_id);
            }
        } catch (\Exception $e) {
            Log::error('Error en getAvailability: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener disponibilidad'], 500);       
        }
    }

    /**
     * Obtiene la disponibilidad diaria del espacio
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param int|null $escritorio_id
     * @return JsonResponse
     */
    private function getDayAvailability($espacio, $fecha, $escritorio_id = null): JsonResponse  
    {
        try {
            // Para espacios coworking
            if ($espacio->tipo === 'coworking') {
                // Mantener la implementación actual para coworking
                $query = Reserva::where('espacio_id', $espacio->id)
                    ->whereDate('fecha_inicio', '<=', $fecha)
                    ->whereDate('fecha_fin', '>=', $fecha)
                    ->whereIn('estado', ['confirmada', 'pendiente']);

                if ($escritorio_id) {
                    $query->where('escritorio_id', $escritorio_id);
                }

                $reservas = $query->get();
                return $this->getCoworkingDayAvailability($espacio, $fecha, $reservas);
            }

            // Para otros tipos de espacios
            $reservas = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $fecha)
                ->whereDate('fecha_fin', '>=', $fecha)
                ->whereIn('estado', ['confirmada', 'pendiente'])
                ->get();

            $slots = $this->generateTimeSlots($fecha, $reservas);

            // Usar estructura esperada por el frontend
            return response()->json([
                'escritorios' => [[
                    'id' => $espacio->id,
                    'numero' => $espacio->nombre,
                    'tipo_espacio' => 'espacio', // Añadir este campo para identificar que no es un escritorio
                    'status' => $this->getSpaceStatus($reservas, $fecha),
                    'slots' => array_map(function($slot) {
                        return [
                            'hora_inicio' => $slot['inicio'],
                            'hora_fin' => $slot['fin'],
                            'disponible' => $slot['status'] === self::STATUS_FREE
                        ];
                    }, $slots)
                ]]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en getDayAvailability: ' . $e->getMessage(), [
                'espacio_id' => $espacio->id,
                'fecha' => $fecha->toDateString()
            ]);
            throw $e;
        }
    }

    /**
     * Determina el estado general del espacio en una fecha
     *
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @param Carbon $fecha
     * @return string
     */
    private function getSpaceStatus($reservas, $fecha): string
    {
        if ($reservas->isEmpty()) {
            return self::STATUS_FREE;
        }

        $diaCubierto = $reservas->contains(function($reserva) {
            return in_array($reserva->tipo_reserva, ['dia_completo', 'semana', 'mes']);
        });

        if ($diaCubierto) {
            return self::STATUS_OCCUPIED;
        }

        return self::STATUS_PARTIAL;
    }

    /**
     * Genera los slots horarios para un día
     * CORRECCIÓN: Mejorada la lógica para determinar ocupación
     *
     * @param Carbon $fecha
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return array
     */
    private function generateTimeSlots($fecha, $reservas): array
    {
        $slots = [];
        $inicio = Carbon::parse($fecha->format('Y-m-d') . ' ' . self::HORA_INICIO);
        $fin = Carbon::parse($fecha->format('Y-m-d') . ' ' . self::HORA_FIN);

        while ($inicio < $fin) {
            $slotFin = $inicio->copy()->addMinutes(self::INTERVALO_MINUTOS);
            $slotOcupado = false;

            // Verificar cada reserva individualmente
            foreach ($reservas as $reserva) {
                if ($reserva->estado !== 'confirmada' && $reserva->estado !== 'pendiente') {    
                    continue; // Ignorar reservas no activas
                }

                $reservaInicio = Carbon::parse($reserva->fecha_inicio);
                $reservaFin = Carbon::parse($reserva->fecha_fin);

                // Para reservas de día completo, semana o mes en la fecha actual
                if (in_array($reserva->tipo_reserva, ['dia_completo', 'semana', 'mes']) &&      
                    $reservaInicio->format('Y-m-d') <= $fecha->format('Y-m-d') &&
                    $reservaFin->format('Y-m-d') >= $fecha->format('Y-m-d')) {
                    $slotOcupado = true;
                    break;
                }

                // Para reservas por horas, verificar superposición
                if ($reservaInicio->format('Y-m-d') === $fecha->format('Y-m-d') &&
                    $reservaInicio->format('H:i') <= $slotFin->format('H:i') &&
                    $reservaFin->format('H:i') >= $inicio->format('H:i')) {
                    $slotOcupado = true;
                    break;
                }
            }

            $slots[] = [
                'inicio' => $inicio->format('H:i'),
                'fin' => $slotFin->format('H:i'),
                'status' => $slotOcupado ? self::STATUS_OCCUPIED : self::STATUS_FREE
            ];

            $inicio = $slotFin;
        }

        return $slots;
    }

    /**
     * Obtiene la disponibilidad semanal del espacio
     * MODIFICADO: Eliminados los cálculos de porcentaje de ocupación
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param int|null $escritorio_id
     * @return JsonResponse
     */
    private function getWeekAvailability($espacio, $fecha, $escritorio_id = null): JsonResponse 
    {
        $weekStart = Carbon::parse($fecha)->startOfWeek();
        $weekEnd = Carbon::parse($fecha)->endOfWeek();

        $weekData = [];

        for ($day = $weekStart->copy(); $day <= $weekEnd; $day->addDay()) {
            $reservas = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $day)
                ->whereDate('fecha_fin', '>=', $day)
                ->whereIn('estado', ['confirmada', 'pendiente'])
                ->get();

            // Para espacios coworking
            if ($espacio->tipo === 'coworking') {
                $totalEscritorios = $espacio->escritorios->count();
                $escritoriosOcupados = 0;

                foreach ($espacio->escritorios as $escritorio) {
                    $escritorioReservas = $reservas->where('escritorio_id', $escritorio->id);   
                    if ($escritorioReservas->isNotEmpty()) {
                        $escritoriosOcupados++;
                    }
                }

                // Determinar estado según ocupación
                $status = 'free'; // Por defecto, libre
                
                if ($totalEscritorios > 0) {
                    if ($escritoriosOcupados === 0) {
                        $status = 'free';
                    } elseif ($escritoriosOcupados === $totalEscritorios) {
                        $status = 'occupied';
                    } else {
                        $status = 'partial';
                    }
                }

                $weekData[$day->format('Y-m-d')] = [
                    'status' => $status
                ];
            } else {
                // Para espacios no-coworking

                // Si hay reservas para todo el día, está ocupado
                $reservaDiaCompleto = $reservas->whereIn('tipo_reserva', ['dia_completo', 'semana', 'mes'])->isNotEmpty();

                // Para reservas por horas, verificar si hay slots ocupados
                $slots = $this->generateTimeSlots($day, $reservas);
                $haySlotOcupados = false;
                
                foreach ($slots as $slot) {
                    if ($slot['status'] !== self::STATUS_FREE) {
                        $haySlotOcupados = true;
                        break;
                    }
                }

                if ($reservaDiaCompleto) {
                    $status = 'occupied';
                } elseif (!$haySlotOcupados) {
                    $status = 'free';
                } else {
                    $status = 'partial';
                }

                $weekData[$day->format('Y-m-d')] = [
                    'status' => $status
                ];
            }
        }

        // Agregar información de depuración para ayudar a diagnosticar
        $debugInfo = [
            'fecha_consulta' => $fecha->format('Y-m-d'),
            'data_count' => count($weekData),
            'espacio_tipo' => $espacio->tipo,
            'primera_fecha' => $weekStart->format('Y-m-d'),
            'ultima_fecha' => $weekEnd->format('Y-m-d')
        ];

        return response()->json([
            'weekData' => $weekData,
            'debug' => $debugInfo
        ]);
    }

    /**
     * Obtiene la disponibilidad mensual del espacio
     * MODIFICADO: Eliminados los cálculos de porcentaje de ocupación
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param int|null $escritorio_id
     * @return JsonResponse
     */
    private function getMonthAvailability($espacio, $fecha, $escritorio_id = null): JsonResponse
    {
        $monthStart = $fecha->copy()->startOfMonth();
        $monthEnd = $fecha->copy()->endOfMonth();
        $monthData = [];

        for ($day = $monthStart->copy(); $day <= $monthEnd; $day->addDay()) {
            $reservas = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $day)
                ->whereDate('fecha_fin', '>=', $day)
                ->whereIn('estado', ['confirmada', 'pendiente']);

            if ($escritorio_id && $espacio->tipo === 'coworking') {
                $reservas->where('escritorio_id', $escritorio_id);
            }

            $dayReservas = $reservas->get();
            
            // Para espacios coworking
            if ($espacio->tipo === 'coworking') {
                $totalEscritorios = $espacio->escritorios->count();
                $escritoriosOcupados = 0;

                foreach ($espacio->escritorios as $escritorio) {
                    $escritorioReservas = $dayReservas->where('escritorio_id', $escritorio->id);
                    if ($escritorioReservas->isNotEmpty()) {
                        $escritoriosOcupados++;
                    }
                }
                
                // Determinar estado según ocupación
                if ($escritoriosOcupados === 0) {
                    $status = 'free';
                } elseif ($escritoriosOcupados === $totalEscritorios) {
                    $status = 'occupied';
                } else {
                    $status = 'partial';
                }
            } else {
                // Para espacios no-coworking
                $reservaDiaCompleto = $dayReservas->whereIn('tipo_reserva', ['dia_completo', 'semana', 'mes'])->isNotEmpty();
                
                $slots = $this->generateTimeSlots($day, $dayReservas);
                $haySlotOcupados = false;
                
                foreach ($slots as $slot) {
                    if ($slot['status'] !== self::STATUS_FREE) {
                        $haySlotOcupados = true;
                        break;
                    }
                }
                
                if ($reservaDiaCompleto) {
                    $status = 'occupied';
                } elseif (!$haySlotOcupados) {
                    $status = 'free';
                } else {
                    $status = 'partial';
                }
            }

            $monthData[$day->format('Y-m-d')] = [
                'status' => $status
            ];
        }

        // Agregar información de depuración
        $debugInfo = [
            'fecha_consulta' => $fecha->format('Y-m-d'),
            'data_count' => count($monthData),
            'espacio_tipo' => $espacio->tipo
        ];

        // Preparar respuesta base
        $response = [
            'monthData' => $monthData,
            'debug' => $debugInfo
        ];

        // Para coworking, agregar escritorios
        if ($espacio->tipo === 'coworking') {
            $response['escritorios'] = $espacio->escritorios()
                ->get()
                ->map(fn($escritorio) => [
                    'id' => $escritorio->id,
                    'numero' => $escritorio->numero
                ]);
        } else {
            $response['escritorios'] = [[
                'id' => $espacio->id,
                'numero' => $espacio->nombre
            ]];
        }

        return response()->json($response);
    }

    /**
     * Formatea las reservas para la respuesta JSON
     *
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return \Illuminate\Support\Collection
     */
    private function formatReservas($reservas)
    {
        return $reservas->map(function($reserva) {
            return [
                'id' => $reserva->id,
                'tipo_reserva' => $reserva->tipo_reserva,
                'estado' => $reserva->estado,
                'hora_inicio' => Carbon::parse($reserva->fecha_inicio)->format('H:i'),
                'hora_fin' => Carbon::parse($reserva->fecha_fin)->format('H:i')
            ];
        });
    }

    /**
     * Obtiene la disponibilidad diaria para espacios coworking
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return JsonResponse
     */
    private function getCoworkingDayAvailability($espacio, $fecha, $reservas): JsonResponse     
    {
        $escritorios = $espacio->escritorios()->get();
        $escritoriosData = [];

        foreach ($escritorios as $escritorio) {
            // Filtrar reservas para este escritorio específico
            $escritorioReservas = $reservas->filter(function($reserva) use ($escritorio) {      
                return $reserva->escritorio_id == $escritorio->id;
            });

            // Generar slots considerando solo reservas activas
            $slots = $this->generateTimeSlots($fecha, $escritorioReservas);

            // Transformar estructura para compatibilidad con DayView.jsx
            $slotsFormateados = array_map(function($slot) {
                return [
                    'hora_inicio' => $slot['inicio'],
                    'hora_fin' => $slot['fin'],
                    'disponible' => $slot['status'] === self::STATUS_FREE
                ];
            }, $slots);

            // Añadir tipo_espacio = 'escritorio' para identificarlo como escritorio real       
            $escritoriosData[] = [
                'id' => $escritorio->id,
                'numero' => $escritorio->numero,
                'tipo_espacio' => 'escritorio', // Añadir este campo para identificarlo como escritorio
                'status' => $this->getSpaceStatus($escritorioReservas, $fecha),
                'slots' => $slotsFormateados,
                'reservas' => $this->formatReservas($escritorioReservas)
            ];
        }

        return response()->json([
            'escritorios' => $escritoriosData
        ]);
    }

    /**
     * Obtiene la disponibilidad de los escritorios para un espacio
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function getDesksAvailability(Request $request, $id): JsonResponse
    {
        try {
            $espacio = Espacio::findOrFail($id);

            if ($espacio->tipo !== 'coworking') {
                return response()->json([
                    'error' => 'Este espacio no tiene escritorios disponibles'
                ], 400);
            }

            $fecha = Carbon::parse($request->fecha);
            $escritorios = $espacio->escritorios()
                ->where('is_active', true)
                ->get()
                ->map(function($escritorio) use ($fecha) {
                    $reservas = Reserva::where('escritorio_id', $escritorio->id)
                        ->whereDate('fecha_inicio', '<=', $fecha)
                        ->whereDate('fecha_fin', '>=', $fecha)
                        ->whereIn('estado', ['confirmada', 'pendiente'])
                        ->get();

                    return [
                        'id' => $escritorio->id,
                        'numero' => $escritorio->numero,
                        'status' => $this->getSpaceStatus($reservas, $fecha)
                    ];
                });

            return response()->json(['escritorios' => $escritorios]);

        } catch (\Exception $e) {
            Log::error('Error en getDesksAvailability: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener disponibilidad de escritorios'], 500);
        }
    }
}