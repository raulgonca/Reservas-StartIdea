<?php

namespace App\Services\Reservas;

use App\Models\Escritorio;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CalendarioService
{
    /**
     * Obtiene los escritorios con su estado para la fecha seleccionada
     */
    public function getEscritorios(Carbon $fecha = null)
    {
        $fecha = $fecha ?? Carbon::now();
        
        try {
            return Escritorio::with(['reservas' => function ($query) use ($fecha) {
                $query->whereDate('fecha_inicio', '<=', $fecha)
                      ->whereDate('fecha_fin', '>=', $fecha)
                      ->where('estado', 'confirmada');
            }])
            ->where('is_active', true)
            ->get()
            ->map(function ($escritorio) {
                return [
                    'id' => $escritorio->id,
                    'numero' => $escritorio->numero,
                    'status' => $this->getEscritorioStatus($escritorio),
                    'slots' => $this->getSlotsDisponibilidad($escritorio)
                ];
            });
        } catch (\Exception $e) {
            Log::error('Error al obtener escritorios:', ['error' => $e->getMessage()]);
            return collect([]);
        }
    }

    /**
     * Obtiene los datos de disponibilidad semanal
     */
    public function getWeekData(Carbon $fecha = null)
    {
        $fecha = $fecha ?? Carbon::now();
        $weekStart = $fecha->copy()->startOfWeek();
        $weekData = [];

        try {
            for ($i = 0; $i < 7; $i++) {
                $currentDate = $weekStart->copy()->addDays($i);
                $weekData[$currentDate->format('Y-m-d')] = [
                    'status' => $this->getDayStatus($currentDate)
                ];
            }

            return $weekData;
        } catch (\Exception $e) {
            Log::error('Error al obtener datos semanales:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Obtiene los datos de disponibilidad mensual
     */
    public function getMonthData(Carbon $fecha = null)
    {
        $fecha = $fecha ?? Carbon::now();
        $monthStart = $fecha->copy()->startOfMonth();
        $monthEnd = $fecha->copy()->endOfMonth();
        $monthData = [];

        try {
            while ($monthStart <= $monthEnd) {
                $monthData[$monthStart->format('Y-m-d')] = [
                    'status' => $this->getDayStatus($monthStart)
                ];
                $monthStart->addDay();
            }

            return $monthData;
        } catch (\Exception $e) {
            Log::error('Error al obtener datos mensuales:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Determina el estado de un escritorio
     */
    protected function getEscritorioStatus($escritorio)
    {
        if (!$escritorio->is_active) return 'unavailable';
        if ($escritorio->reservas->isEmpty()) return 'free';
        
        $reservasDiaCompleto = $escritorio->reservas->where('tipo_reserva', 'dia_completo');
        if ($reservasDiaCompleto->isNotEmpty()) return 'occupied';
        
        return $escritorio->reservas->isNotEmpty() ? 'partial' : 'free';
    }

    /**
     * Obtiene los slots de disponibilidad para un escritorio
     */
    protected function getSlotsDisponibilidad($escritorio)
    {
        // Implementar lógica de slots según necesidades
        return [];
    }

    /**
     * Determina el estado general de un día
     */
    protected function getDayStatus(Carbon $fecha)
    {
        $escritorios = Escritorio::where('is_active', true)->get();
        if ($escritorios->isEmpty()) return 'unavailable';

        $reservas = Reserva::whereDate('fecha_inicio', '<=', $fecha)
            ->whereDate('fecha_fin', '>=', $fecha)
            ->where('estado', 'confirmada')
            ->get();

        if ($reservas->isEmpty()) return 'free';

        $escritoriosOcupados = $reservas->where('tipo_reserva', 'dia_completo')->count();
        
        if ($escritoriosOcupados === $escritorios->count()) return 'occupied';
        if ($escritoriosOcupados > 0) return 'partial';
        
        return 'free';
    }
}