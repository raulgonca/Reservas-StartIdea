<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Espacio;
use App\Models\User;
use App\Models\Bloqueo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardStatService
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    public function getAllStats()
    {
        $isAdmin = $this->user->role === 'admin' || $this->user->role === 'superadmin';
        $isSuperAdmin = $this->user->role === 'superadmin';

        return [
            'stats' => $this->getStats($isAdmin, $isSuperAdmin),
            'chartData' => $this->getChartData($isAdmin),
            'proximasReservas' => $this->getProximasReservas($isAdmin),
            'historialReservas' => $this->getHistorialReservas($isAdmin),
        ];
    }

    public function getStats($isAdmin = false, $isSuperAdmin = false)
    {
        // Estadísticas básicas para todos los usuarios
        $stats = [
            'misReservas' => Reserva::where('user_id', $this->user->id)->count(),
            'proximasReservas' => Reserva::where('user_id', $this->user->id)
                                    ->where('fecha_inicio', '>=', now())
                                    ->count(),
            'espaciosActivos' => Espacio::where('is_active', true)->count(), // Corregido: activo -> is_active
            'ocupacion' => $this->calcularOcupacion(),
        ];
        
        // Estadísticas adicionales para administradores
        if ($isAdmin) {
            $stats['totalReservas'] = Reserva::count();
            $stats['reservasHoy'] = Reserva::whereDate('fecha_inicio', today())->count();
            
            if ($isSuperAdmin) {
                $stats['totalUsuarios'] = User::count();
                $stats['bloqueos'] = Bloqueo::where('fecha_fin', '>=', now())->count();
            }
        }
        
        return $stats;
    }

    public function getChartData($isAdmin = false)
    {
        // Datos de gráficos para todos los usuarios
        $chartData = [
            'reservasPorMes' => $this->getReservasPorMes($this->user->id),
            'distribucionEspacios' => $this->getDistribucionEspacios($this->user->id),
        ];
        
        // Datos adicionales para administradores
        if ($isAdmin) {
            $chartData['tendenciaReservas'] = $this->getTendenciaReservas();
            $chartData['ocupacionPorEspacio'] = $this->getOcupacionPorEspacio();
            $chartData['reservasPorDia'] = $this->getReservasPorDia();
        }
        
        return $chartData;
    }

    public function getProximasReservas($isAdmin = false)
    {
        return Reserva::with(['espacio', 'user'])
                ->when(!$isAdmin, function($query) {
                    return $query->where('user_id', $this->user->id);
                })
                ->where('fecha_inicio', '>=', now())
                ->orderBy('fecha_inicio')
                ->take(5)
                ->get();
    }

    public function getHistorialReservas($isAdmin = false)
    {
        return Reserva::with(['espacio', 'user'])
                ->when(!$isAdmin, function($query) {
                    return $query->where('user_id', $this->user->id);
                })
                ->where('fecha_inicio', '<', now())
                ->orderBy('fecha_inicio', 'desc')
                ->take(5)
                ->get();
    }

    private function calcularOcupacion()
    {
        $totalEspacios = Espacio::where('is_active', true)->count(); // Corregido: activo -> is_active
        if ($totalEspacios === 0) return 0;
        
        $espaciosOcupados = Espacio::whereHas('reservas', function($query) {
            $query->whereDate('fecha_inicio', today());
        })->count();
        
        return round(($espaciosOcupados / $totalEspacios) * 100);
    }

    private function getReservasPorMes($userId)
    {
        $meses = [];
        $totales = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $fecha = Carbon::now()->subMonths($i);
            $meses[] = $fecha->format('M Y');
            
            $total = Reserva::where('user_id', $userId)
                        ->whereYear('fecha_inicio', $fecha->year)
                        ->whereMonth('fecha_inicio', $fecha->month)
                        ->count();
            
            $totales[] = $total;
        }
        
        return [
            'labels' => $meses,
            'datasets' => [
                [
                    'label' => 'Reservas',
                    'data' => $totales,
                    'backgroundColor' => 'rgba(54, 162, 235, 0.5)',
                    'borderColor' => 'rgb(54, 162, 235)',
                    'borderWidth' => 1
                ]
            ]
        ];
    }

    private function getDistribucionEspacios($userId)
    {
        $espacios = Espacio::withCount(['reservas' => function($query) use ($userId) {
                        $query->where('user_id', $userId);
                    }])
                    ->having('reservas_count', '>', 0)
                    ->get();
        
        $labels = $espacios->pluck('nombre')->toArray();
        $data = $espacios->pluck('reservas_count')->toArray();
        
        // Colores para el gráfico
        $backgroundColor = [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
        ];
        
        $borderColor = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
        ];
        
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Reservas por Espacio',
                    'data' => $data,
                    'backgroundColor' => $backgroundColor,
                    'borderColor' => $borderColor,
                    'borderWidth' => 1
                ]
            ]
        ];
    }

    private function getTendenciaReservas()
    {
        $fechas = [];
        $totales = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $fecha = Carbon::now()->subMonths($i);
            $fechas[] = $fecha->format('M Y');
            
            $total = Reserva::whereYear('fecha_inicio', $fecha->year)
                        ->whereMonth('fecha_inicio', $fecha->month)
                        ->count();
            
            $totales[] = $total;
        }
        
        return [
            'labels' => $fechas,
            'datasets' => [
                [
                    'label' => 'Reservas',
                    'data' => $totales,
                    'fill' => true,
                    'backgroundColor' => 'rgba(75, 192, 192, 0.2)',
                    'borderColor' => 'rgba(75, 192, 192, 1)',
                    'tension' => 0.4
                ]
            ]
        ];
    }

    private function getOcupacionPorEspacio()
    {
        $espacios = Espacio::withCount('reservas')
                    ->having('reservas_count', '>', 0)
                    ->orderBy('reservas_count', 'desc')
                    ->take(5)
                    ->get();
        
        $labels = $espacios->pluck('nombre')->toArray();
        $data = $espacios->pluck('reservas_count')->toArray();
        
        // Colores para el gráfico
        $backgroundColor = [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
        ];
        
        $borderColor = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
        ];
        
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Ocupación',
                    'data' => $data,
                    'backgroundColor' => $backgroundColor,
                    'borderColor' => $borderColor,
                    'borderWidth' => 1
                ]
            ]
        ];
    }

    private function getReservasPorDia()
    {
        $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        $totales = array_fill(0, 7, 0);
        
        $reservas = Reserva::selectRaw('DAYOFWEEK(fecha_inicio) as dia, COUNT(*) as total')
                        ->groupBy('dia')
                        ->get();
        
        foreach ($reservas as $reserva) {
            // DAYOFWEEK en MySQL: 1 = Domingo, 2 = Lunes, etc.
            // Ajustamos para que 0 = Lunes, 1 = Martes, etc.
            $index = ($reserva->dia - 2 + 7) % 7;
            $totales[$index] = $reserva->total;
        }
        
        return [
            'labels' => $dias,
            'datasets' => [
                [
                    'label' => 'Reservas por día',
                    'data' => $totales,
                    'backgroundColor' => 'rgba(54, 162, 235, 0.5)',
                    'borderColor' => 'rgb(54, 162, 235)',
                    'borderWidth' => 1
                ]
            ]
        ];
    }
}