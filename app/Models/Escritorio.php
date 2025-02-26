<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Escritorio extends Model
{
    use HasFactory;

    /**
     * Estados posibles para un escritorio
     */
    public const STATUS_FREE = 'free';
    public const STATUS_OCCUPIED = 'occupied';
    public const STATUS_PARTIAL = 'partial';
    public const STATUS_UNAVAILABLE = 'unavailable';

    /**
     * Atributos que son asignables en masa
     *
     * @var array<string>
     */
    protected $fillable = [
        'espacio_id',
        'numero',
        'is_active'
    ];

    /**
     * Atributos que deben ser convertidos a tipos nativos
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Obtiene el espacio al que pertenece el escritorio
     *
     * @return BelongsTo
     */
    public function espacio(): BelongsTo
    {
        return $this->belongsTo(Espacio::class);
    }

    /**
     * Obtiene las reservas asociadas al escritorio
     *
     * @return HasMany
     */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * Obtiene el estado del escritorio para una fecha específica
     *
     * @param Carbon $fecha
     * @return string
     * @throws \Exception
     */
    public function getStatusForDate(Carbon $fecha): string
    {
        try {
            if (!$this->is_active) {
                return self::STATUS_UNAVAILABLE;
            }

            $reservas = $this->reservas()
                ->where('estado', 'confirmada')
                ->whereDate('fecha_inicio', '<=', $fecha)
                ->whereDate('fecha_fin', '>=', $fecha)
                ->get();

            if ($reservas->isEmpty()) {
                return self::STATUS_FREE;
            }

            $reservasDiaCompleto = $reservas->where('tipo_reserva', 'dia_completo');
            if ($reservasDiaCompleto->isNotEmpty()) {
                return self::STATUS_OCCUPIED;
            }

            return self::STATUS_PARTIAL;

        } catch (\Exception $e) {
            Log::error('Error al obtener estado del escritorio', [
                'escritorio_id' => $this->id,
                'fecha' => $fecha,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene los slots disponibles para una fecha específica
     *
     * @param Carbon $fecha
     * @return array<int, array<string, string>>
     * @throws \Exception
     */
    public function getAvailableSlots(Carbon $fecha): array
    {
        try {
            if (!$this->is_active) {
                return [];
            }

            $horarioInicio = $this->espacio->horario_inicio ?? '08:00';
            $horarioFin = $this->espacio->horario_fin ?? '20:00';
            
            $slots = [];
            $currentTime = Carbon::parse($fecha->format('Y-m-d') . ' ' . $horarioInicio);
            $endTime = Carbon::parse($fecha->format('Y-m-d') . ' ' . $horarioFin);

            while ($currentTime < $endTime) {
                $slotEnd = $currentTime->copy()->addHour();
                $slots[] = [
                    'inicio' => $currentTime->format('H:i'),
                    'fin' => $slotEnd->format('H:i'),
                    'status' => $this->getSlotStatus($currentTime, $slotEnd)
                ];
                $currentTime->addHour();
            }

            return $slots;

        } catch (\Exception $e) {
            Log::error('Error al obtener slots disponibles', [
                'escritorio_id' => $this->id,
                'fecha' => $fecha,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Verifica el estado de un slot específico
     *
     * @param Carbon $inicio
     * @param Carbon $fin
     * @return string
     */
    protected function getSlotStatus(Carbon $inicio, Carbon $fin): string
    {
        try {
            $reservas = $this->reservas()
                ->where('estado', 'confirmada')
                ->where(function ($query) use ($inicio, $fin) {
                    $query->where(function ($q) use ($inicio, $fin) {
                        $q->where('fecha_inicio', '<=', $fin)
                          ->where('fecha_fin', '>=', $inicio);
                    });
                })->exists();

            return $reservas ? self::STATUS_OCCUPIED : self::STATUS_FREE;

        } catch (\Exception $e) {
            Log::error('Error al verificar estado del slot', [
                'escritorio_id' => $this->id,
                'inicio' => $inicio,
                'fin' => $fin,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Scope para filtrar escritorios activos
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActivo($query)
    {
        return $query->where('is_active', true);
    }
}