<?php

namespace App\Services;

use App\Models\Espacio;
use App\Models\Escritorio;
use App\Models\Reserva;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AvailabilityService
{
    // Constantes para estados de disponibilidad
    private const STATUS_FREE = 'free';
    private const STATUS_PARTIAL = 'partial';
    private const STATUS_OCCUPIED = 'occupied';
    
    /**
     * Obtiene la hora de inicio desde la configuración centralizada
     * @return string
     */
    public function getHoraInicio(): string
    {
        return config('reservas.horarios.hora_inicio', '08:00');
    }
    
    /**
     * Obtiene la hora de fin desde la configuración centralizada
     * @return string
     */
    public function getHoraFin(): string
    {
        return config('reservas.horarios.hora_fin', '22:00');
    }
    
    /**
     * Obtiene el intervalo de minutos entre slots desde la configuración centralizada
     * @return int
     */
    public function getIntervaloMinutos(): int
    {
        return config('reservas.horarios.intervalo_minutos', 60);
    }

    /**
     * Obtiene la disponibilidad de un espacio para una fecha específica
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param string $vista (day, week, month)
     * @param int|null $escritorio_id
     * @return array
     */
    public function getEspacioAvailability(Espacio $espacio, Carbon $fecha, string $vista = 'day', ?int $escritorio_id = null): array
    {
        Log::info('Consultando disponibilidad', [
            'espacio_id' => $espacio->id,
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
    }

    /**
     * Obtiene la disponibilidad diaria del espacio
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param int|null $escritorio_id
     * @return array
     */
    public function getDayAvailability($espacio, $fecha, $escritorio_id = null): array
    {
        try {
            // Para espacios coworking
            if ($espacio->tipo === 'coworking') {
                // Consulta para espacios coworking
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
                    // Exactamente la misma fecha para la vista diaria
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
            return [
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
            ];

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
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return array
     */
    public function getCoworkingDayAvailability($espacio, $fecha, $reservas): array     
    {
        try {
            $escritorios = $espacio->escritorios()->activo()->get();
            $escritoriosData = [];
            
            foreach ($escritorios as $escritorio) {
                $escritorioReservas = $reservas->filter(function($reserva) use ($escritorio) {
                    return $reserva->escritorio_id == $escritorio->id;
                });
                
                $slots = $this->generateSlotsForCoworking($fecha, $escritorioReservas);
                
                // Determinar estado general del escritorio
                $slotsOcupados = collect($slots)->filter(fn($slot) => !$slot['disponible'])->count();
                $status = $this->determineStatus($slotsOcupados, count($slots));
                
                $escritoriosData[] = [
                    'id' => $escritorio->id,
                    'numero' => $escritorio->numero,
                    'tipo_espacio' => 'escritorio',
                    'status' => $status,
                    'slots' => $slots
                ];
            }
            
            return ['escritorios' => $escritoriosData];
        } catch (\Exception $e) {
            Log::error('Error en getCoworkingDayAvailability', [
                'error' => $e->getMessage(),
                'espacio_id' => $espacio->id,
                'fecha' => $fecha->format('Y-m-d')
            ]);
            throw $e;
        }
    }

    /**
     * Genera slots para espacios de coworking usando la configuración centralizada
     * 
     * @param Carbon $fecha
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return array
     */
    private function generateSlotsForCoworking($fecha, $reservas): array
    {
        $slots = [];
        $inicio = Carbon::parse($fecha->format('Y-m-d') . ' ' . $this->getHoraInicio());
        $fin = Carbon::parse($fecha->format('Y-m-d') . ' ' . $this->getHoraFin());

        while ($inicio < $fin) {
            $slotFin = $inicio->copy()->addMinutes($this->getIntervaloMinutos());
            $slotOcupado = false;

            foreach ($reservas as $reserva) {
                if ($this->isSlotOccupied($inicio, $slotFin, $reserva)) {
                    $slotOcupado = true;
                    break;
                }
            }

            $slots[] = [
                'hora_inicio' => $inicio->format('H:i'),
                'hora_fin' => $slotFin->format('H:i'),
                'disponible' => !$slotOcupado
            ];

            $inicio = $slotFin;
        }

        return $slots;
    }

    /**
     * Determina si un slot está ocupado por una reserva
     * 
     * @param Carbon $slotInicio
     * @param Carbon $slotFin
     * @param Reserva $reserva
     * @return bool
     */
    private function isSlotOccupied($slotInicio, $slotFin, $reserva): bool
    {
        if ($reserva->estado !== 'confirmada') {
            return false;
        }

        $reservaInicio = Carbon::parse($reserva->fecha_inicio);
        $reservaFin = Carbon::parse($reserva->fecha_fin);

        // Para reservas de día completo, semana o mes
        if (in_array($reserva->tipo_reserva, ['dia_completo', 'semana', 'mes'])) {
            return true;
        }

        // Para reservas por hora o medio día
        return $reservaInicio < $slotFin && $reservaFin > $slotInicio;
    }

    /**
     * Determina el estado general basado en slots ocupados
     * 
     * @param int $slotsOcupados
     * @param int $totalSlots
     * @return string
     */
    private function determineStatus($slotsOcupados, $totalSlots): string
    {
        if ($slotsOcupados === 0) {
            return self::STATUS_FREE;
        }
        if ($slotsOcupados === $totalSlots) {
            return self::STATUS_OCCUPIED;
        }
        return self::STATUS_PARTIAL;
    }

    /**
     * Genera los slots horarios para un día usando la configuración centralizada
     * 
     * @param Carbon $fecha
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return array
     */
    private function generateTimeSlots($fecha, $reservas): array
    {
        $slots = [];
        $inicio = Carbon::parse($fecha->format('Y-m-d') . ' ' . $this->getHoraInicio());
        $fin = Carbon::parse($fecha->format('Y-m-d') . ' ' . $this->getHoraFin());

        while ($inicio < $fin) {
            $slotFin = $inicio->copy()->addMinutes($this->getIntervaloMinutos());
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

                // Para reservas por hora o medio día
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
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param int|null $escritorio_id
     * @return array
     */
    public function getWeekAvailability($espacio, $fecha, $escritorio_id = null): array 
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

                // Crear un array de depuración más sencillo
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

            return [
                'weekData' => $weekData,
                'debug' => [
                    'fecha_consulta' => $fecha->format('Y-m-d'),
                    'data_count' => count($weekData),
                    'espacio_tipo' => $espacio->tipo,
                    'primera_fecha' => $weekStart->format('Y-m-d'),
                    'ultima_fecha' => $weekEnd->format('Y-m-d')
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Error en getWeekAvailability: ' . $e->getMessage(), [
                'espacio_id' => $espacio->id,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene la disponibilidad mensual del espacio
     *
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @param int|null $escritorio_id
     * @return array
     */
    public function getMonthAvailability($espacio, $fecha, $escritorio_id = null): array
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

        // Preparar respuesta
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

        return $response;
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
     * @param Espacio $espacio
     * @param Carbon $fecha
     * @return array
     */
    public function getDesksAvailability($espacio, $fecha): array
    {
        if ($espacio->tipo !== 'coworking') {
            return ['error' => 'Este espacio no tiene escritorios disponibles'];
        }

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

        return ['escritorios' => $escritorios];
    }
    
    /**
     * Formatea las reservas para la respuesta
     *
     * @param \Illuminate\Database\Eloquent\Collection $reservas
     * @return \Illuminate\Support\Collection
     */
    public function formatReservas($reservas)
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
}