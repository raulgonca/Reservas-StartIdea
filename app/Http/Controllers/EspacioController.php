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
            
            // CORRECCIÓN: Parseo explícito de la fecha con validación
            try {
                $fecha = Carbon::parse($request->fecha);
            } catch (\Exception $e) {
                // Si hay error al parsear la fecha, usar la fecha actual
                $fecha = Carbon::today();
                Log::warning('Fecha inválida en la solicitud, usando fecha actual', [
                    'fecha_solicitada' => $request->fecha,
                    'fecha_usada' => $fecha->format('Y-m-d')
                ]);
            }
            
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
                // CORRECCIÓN: Consulta mejorada para coworking
                $query = Reserva::where('espacio_id', $espacio->id)
                    ->where(function($q) use ($fecha) {
                        $q->whereDate('fecha_inicio', '=', $fecha->format('Y-m-d'))
                          ->orWhere(function($q2) use ($fecha) {
                              $q2->whereDate('fecha_inicio', '<=', $fecha->format('Y-m-d'))
                                 ->whereDate('fecha_fin', '>=', $fecha->format('Y-m-d'));
                          });
                    })
                    ->whereIn('estado', ['confirmada', 'pendiente']);

                if ($escritorio_id) {
                    $query->where('escritorio_id', $escritorio_id);
                }

                $reservas = $query->get();
                
                // Log para depuración
                Log::debug('Reservas coworking para disponibilidad diaria', [
                    'espacio_id' => $espacio->id,
                    'espacio_nombre' => $espacio->nombre,
                    'fecha' => $fecha->format('Y-m-d'),
                    'cantidad_reservas' => $reservas->count(),
                    'reservas' => $reservas->map(function($r) {
                        return [
                            'id' => $r->id,
                            'escritorio_id' => $r->escritorio_id,
                            'fecha_inicio' => $r->fecha_inicio,
                            'fecha_fin' => $r->fecha_fin
                        ];
                    })
                ]);
                
                return $this->getCoworkingDayAvailability($espacio, $fecha, $reservas);
            }

            // Para otros tipos de espacios
            $reservas = Reserva::where('espacio_id', $espacio->id)
                ->where(function($query) use ($fecha) {
                    // CORRECCIÓN: Exactamente la misma fecha para la vista diaria
                    $query->whereDate('fecha_inicio', '=', $fecha->format('Y-m-d'))
                    // O reservas que abarcan este día
                    ->orWhere(function($q) use ($fecha) {
                        $q->whereDate('fecha_inicio', '<', $fecha->format('Y-m-d'))
                          ->whereDate('fecha_fin', '>=', $fecha->format('Y-m-d'));
                    });
                })
                ->whereIn('estado', ['confirmada', 'pendiente'])
                ->get();
            
            // Log detallado para depuración
            Log::debug('Reservas encontradas para disponibilidad diaria', [
                'espacio_id' => $espacio->id, 
                'espacio_nombre' => $espacio->nombre,
                'fecha' => $fecha->format('Y-m-d'),
                'cantidad_reservas' => $reservas->count(),
                'reservas' => $reservas->map(function($r) {
                    return [
                        'id' => $r->id,
                        'fecha_inicio' => $r->fecha_inicio,
                        'fecha_fin' => $r->fecha_fin,
                        'estado' => $r->estado,
                        'tipo_reserva' => $r->tipo_reserva
                    ];
                })
            ]);

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
     * Obtiene la disponibilidad diaria para espacios coworking
     * CORREGIDO: Verificación apropiada de ocupación por slots horarios
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
        
        // Contador para depuración
        $escritoriosConReservas = 0;

        foreach ($escritorios as $escritorio) {
            // Filtrar reservas para este escritorio específico
            $escritorioReservas = $reservas->filter(function($reserva) use ($escritorio) {      
                return $reserva->escritorio_id == $escritorio->id;
            });
            
            // Si hay reservas para este escritorio, incrementar contador
            if ($escritorioReservas->isNotEmpty()) {
                $escritoriosConReservas++;
            }

            // Inicializar slots horarios para este día
            $inicio = Carbon::parse($fecha->format('Y-m-d') . ' ' . self::HORA_INICIO);
            $fin = Carbon::parse($fecha->format('Y-m-d') . ' ' . self::HORA_FIN);
            $slots = [];

            // Verificar cada slot horario
            while ($inicio < $fin) {
                $slotFin = $inicio->copy()->addMinutes(self::INTERVALO_MINUTOS);
                $slotOcupado = false;

                // CORRECCIÓN: Para cada reserva de este escritorio, verificar si ocupa este slot
                foreach ($escritorioReservas as $reserva) {
                    if ($reserva->estado !== 'confirmada' && $reserva->estado !== 'pendiente') {
                        continue; // Solo considerar reservas activas
                    }

                    $reservaInicio = Carbon::parse($reserva->fecha_inicio);
                    $reservaFin = Carbon::parse($reserva->fecha_fin);

                    // Verificar si es reserva de día completo, semana o mes para este día
                    if (in_array($reserva->tipo_reserva, ['dia_completo', 'semana', 'mes']) &&
                        $reservaInicio->format('Y-m-d') <= $fecha->format('Y-m-d') &&
                        $reservaFin->format('Y-m-d') >= $fecha->format('Y-m-d')) {
                        $slotOcupado = true;
                        break;
                    }

                    // CORRECCIÓN: Para reservas por hora, verificación precisa de superposición
                    if ($reserva->tipo_reserva === 'hora' || $reserva->tipo_reserva === 'medio_dia') {
                        // Crear objetos Carbon completos (fecha + hora)
                        $slotInicioFull = Carbon::parse($fecha->format('Y-m-d') . ' ' . $inicio->format('H:i:s'));
                        $slotFinFull = Carbon::parse($fecha->format('Y-m-d') . ' ' . $slotFin->format('H:i:s'));
                        
                        // Verificar superposición real (no solo bordes)
                        // Un slot está ocupado si la reserva empieza antes de que termine el slot
                        // Y la reserva termina después de que empieza el slot
                        if ($reservaInicio < $slotFinFull && $reservaFin > $slotInicioFull) {
                            $slotOcupado = true;
                            
                            Log::debug('Slot coworking ocupado', [
                                'reserva_id' => $reserva->id,
                                'escritorio_id' => $escritorio->id,
                                'slot_inicio' => $inicio->format('H:i'),
                                'slot_fin' => $slotFin->format('H:i'),
                                'reserva_inicio' => $reservaInicio->format('H:i'),
                                'reserva_fin' => $reservaFin->format('H:i')
                            ]);
                            
                            break;
                        }
                    }
                }

                // Añadir el slot con su estado correcto
                $slots[] = [
                    'hora_inicio' => $inicio->format('H:i'),
                    'hora_fin' => $slotFin->format('H:i'),
                    'disponible' => !$slotOcupado
                ];

                $inicio = $slotFin;
            }

            // Determinar el estado general del escritorio basado en sus slots
            $slotsOcupados = array_filter($slots, function($slot) {
                return !$slot['disponible'];
            });

            $status = self::STATUS_FREE;
            if (count($slotsOcupados) > 0) {
                $status = (count($slotsOcupados) === count($slots)) ? 
                    self::STATUS_OCCUPIED : self::STATUS_PARTIAL;
            }

            // Añadir datos completos del escritorio
            $escritoriosData[] = [
                'id' => $escritorio->id,
                'numero' => $escritorio->numero,
                'tipo_espacio' => 'escritorio',
                'status' => $status, // Estado actualizado según slots ocupados
                'slots' => $slots,
                'reservas' => $this->formatReservas($escritorioReservas)
            ];
        }

        // Registrar información para depuración
        Log::debug('Vista diaria de escritorios', [
            'fecha' => $fecha->format('Y-m-d'),
            'espacio_id' => $espacio->id,
            'total_escritorios' => count($escritorios),
            'escritorios_con_reservas' => $escritoriosConReservas
        ]);

        return response()->json([
            'escritorios' => $escritoriosData
        ]);
    }

    /**
     * Genera los slots horarios para un día
     * CORRECCIÓN: Lógica mejorada para determinar ocupación
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

            foreach ($reservas as $reserva) {
                if ($reserva->estado !== 'confirmada' && $reserva->estado !== 'pendiente') {
                    continue;
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

                // CORRECCIÓN: Para reservas por hora o medio día
                if ($reserva->tipo_reserva === 'hora' || $reserva->tipo_reserva === 'medio_dia') {
                    // Solo verificar reservas de la fecha correcta
                    if ($reservaInicio->format('Y-m-d') === $fecha->format('Y-m-d')) {
                        // Crear objetos Carbon completos para el slot actual y la reserva
                        $slotInicioFull = Carbon::parse($fecha->format('Y-m-d') . ' ' . $inicio->format('H:i:s'));
                        $slotFinFull = Carbon::parse($fecha->format('Y-m-d') . ' ' . $slotFin->format('H:i:s'));
                        
                        // Un slot está ocupado si hay superposición real
                        // La reserva empieza antes de que termine el slot Y termina después de que empieza el slot
                        if ($reservaInicio < $slotFinFull && $reservaFin > $slotInicioFull) {
                            $slotOcupado = true;
                            
                            Log::debug('Slot marcado como ocupado', [
                                'reserva_id' => $reserva->id,
                                'slot_inicio' => $inicio->format('H:i'),
                                'slot_fin' => $slotFin->format('H:i'),
                                'reserva_inicio' => $reservaInicio->format('H:i'),
                                'reserva_fin' => $reservaFin->format('H:i')
                            ]);
                            
                            break;
                        }
                    }
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
        try {
            // Asegurarse que $fecha sea una instancia de Carbon
            if (!($fecha instanceof Carbon)) {
                $fecha = Carbon::parse($fecha);
            }
            
            $weekStart = $fecha->copy()->startOfWeek();
            $weekEnd = $fecha->copy()->endOfWeek();

            $weekData = [];
            $depuracionDias = [];  // Array para almacenar información detallada de cada día

            for ($day = $weekStart->copy(); $day <= $weekEnd; $day->addDay()) {
                $currentDate = $day->format('Y-m-d');
                
                $reservas = Reserva::where('espacio_id', $espacio->id)
                    ->whereDate('fecha_inicio', '<=', $day)
                    ->whereDate('fecha_fin', '>=', $day)
                    ->whereIn('estado', ['confirmada', 'pendiente'])
                    ->get();

                // SIMPLIFICADO: Crear un array de depuración más sencillo
                $depuracionDia = [
                    'fecha' => $currentDate,
                    'total_reservas' => $reservas->count(),
                    'confirmadas' => $reservas->where('estado', 'confirmada')->count(),
                    'pendientes' => $reservas->where('estado', 'pendiente')->count()
                ];

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

                    $depuracionDia['escritorios'] = [
                        'total' => $totalEscritorios,
                        'ocupados' => $escritoriosOcupados
                    ];

                    // Determinar estado según ocupación
                    if ($totalEscritorios > 0) {
                        if ($escritoriosOcupados === 0) {
                            $status = 'free';
                        } elseif ($escritoriosOcupados === $totalEscritorios) {
                            $status = 'occupied';
                        } else {
                            $status = 'partial';
                        }
                    } else {
                        $status = 'free';
                    }
                } else {
                    // Para espacios no-coworking
                    $reservaDiaCompleto = $reservas->whereIn('tipo_reserva', ['dia_completo', 'semana', 'mes'])->isNotEmpty();
                    
                    $slots = $this->generateTimeSlots($day, $reservas);
                    $haySlotOcupados = false;
                    $slotsOcupados = 0;
                    
                    foreach ($slots as $slot) {
                        if ($slot['status'] !== self::STATUS_FREE) {
                            $haySlotOcupados = true;
                            $slotsOcupados++;
                        }
                    }
                    
                    $depuracionDia['slots'] = [
                        'total' => count($slots),
                        'ocupados' => $slotsOcupados
                    ];

                    if ($reservaDiaCompleto) {
                        $status = 'occupied';
                    } elseif (!$haySlotOcupados) {
                        $status = 'free';
                    } else {
                        $status = 'partial';
                    }
                }
                
                $depuracionDia['status'] = $status;
                $weekData[$currentDate] = ['status' => $status];
                $depuracionDias[$currentDate] = $depuracionDia;
            }

            Log::debug('Análisis de disponibilidad semanal', [
                'espacio_id' => $espacio->id,
                'espacio_nombre' => $espacio->nombre,
                'tipo' => $espacio->tipo,
                'datos_dias' => $depuracionDias
            ]);

            return response()->json([
                'weekData' => $weekData,
                'debug' => [
                    'fecha_consulta' => $fecha->format('Y-m-d'),
                    'data_count' => count($weekData),
                    'espacio_tipo' => $espacio->tipo,
                    'primera_fecha' => $weekStart->format('Y-m-d'),
                    'ultima_fecha' => $weekEnd->format('Y-m-d')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getWeekAvailability: ' . $e->getMessage(), [
                'espacio_id' => $espacio->id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error al procesar disponibilidad semanal'], 500);
        }
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
     * Determina el estado de un espacio basado en sus reservas
     *
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @param Carbon $fecha
     * @return string
     */
    private function getSpaceStatus($reservas, $fecha)
    {
        if ($reservas->isEmpty()) {
            return self::STATUS_FREE;
        }

        $reservaDiaCompleto = $reservas->whereIn('tipo_reserva', ['dia_completo', 'semana', 'mes'])
            ->filter(function($reserva) use ($fecha) {
                return Carbon::parse($reserva->fecha_inicio)->startOfDay() <= $fecha &&
                       Carbon::parse($reserva->fecha_fin)->endOfDay() >= $fecha;
            })
            ->isNotEmpty();

        if ($reservaDiaCompleto) {
            return self::STATUS_OCCUPIED;
        }

        return self::STATUS_PARTIAL;
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