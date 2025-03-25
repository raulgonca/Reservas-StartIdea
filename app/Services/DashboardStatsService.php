<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Espacio;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardStatsService
{
    public function getUserStats($userId)
    {
        return [
            'misReservas' => Reserva::where('user_id', $userId)->count(),
            'proximasReservas' => Reserva::where('user_id', $userId)
                ->where('fecha_inicio', '>=', Carbon::now())
                ->count(),
            'espaciosActivos' => Espacio::where('is_active', true)->count(),
            'ocupacion' => $this->calcularOcupacion(),
        ];
    }

    public function getAdminStats()
    {
        return [
            'totalReservas' => Reserva::count(),
            'reservasHoy' => Reserva::whereDate('fecha_inicio', Carbon::today())->count(),
            'espaciosActivos' => Espacio::where('is_active', true)->count(),
            'ocupacion' => $this->calcularOcupacion(),
            'totalUsuarios' => User::count(),
            'bloqueos' => $this->getBloqueos(),
        ];
    }

    public function getSuperAdminStats()
    {
        return [
            'adminUsers' => User::where('role', 'admin')->count(),
            'superAdminUsers' => User::where('role', 'superadmin')->count(),
            'totalEspacios' => Espacio::count(),
            'espaciosInactivos' => Espacio::where('is_active', false)->count(),
            'reservasCanceladas' => Reserva::where('estado', 'cancelada')->count(),
            'ultimosUsuariosRegistrados' => User::orderBy('created_at', 'desc')
                ->take(5)
                ->get(['id', 'name', 'email', 'role', 'created_at']),
        ];
    }

    private function calcularOcupacion()
    {
        $espaciosActivos = Espacio::where('is_active', true)->count();
        if ($espaciosActivos === 0) return 0;

        $reservasActivas = Reserva::whereDate('fecha_inicio', Carbon::today())
            ->where('estado', 'confirmada')
            ->count();

        return round(($reservasActivas / $espaciosActivos) * 100);
    }

    private function getBloqueos()
    {
        try {
            return Espacio::whereHas('bloqueos', function($query) {
                $query->where('fecha_fin', '>=', Carbon::now());
            })->count();
        } catch (\Exception $e) {
            Log::error('Error al obtener bloqueos: ' . $e->getMessage());
            return 0;
        }
    }

    public function getAdminChartData()
    {
        return [
            'reservasPorDia' => $this->getReservasPorDia(),
            'ocupacionPorEspacio' => $this->getOcupacionPorEspacio(),
            'tendenciaReservas' => $this->getTendenciaReservas(),
        ];
    }

    public function getUserChartData($userId)
    {
        return [
            'reservasPorMes' => $this->getReservasPorMes($userId),
            'distribucionEspacios' => $this->getDistribucionEspacios($userId),
        ];
    }

    private function getReservasPorDia()
    {
        $fechas = collect(range(0, 6))->map(function($dias) {
            return Carbon::now()->subDays($dias)->format('Y-m-d');
        });

        $reservas = Reserva::whereIn('fecha_inicio', $fechas)
            ->selectRaw('DATE(fecha_inicio) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->pluck('total', 'fecha');

        return [
            'labels' => $fechas->map(fn($fecha) => Carbon::parse($fecha)->format('D'))->toArray(),
            'datasets' => [[
                'label' => 'Reservas',
                'data' => $fechas->map(fn($fecha) => $reservas[$fecha] ?? 0)->toArray(),
                'backgroundColor' => 'rgba(54, 162, 235, 0.5)',
                'borderColor' => 'rgb(54, 162, 235)',
                'borderWidth' => 1
            ]]
        ];
    }

    private function getOcupacionPorEspacio()
    {
        $espacios = Espacio::with(['reservas' => function($query) {
            $query->whereDate('fecha_inicio', Carbon::today());
        }])->get();

        return [
            'labels' => $espacios->pluck('nombre')->toArray(),
            'datasets' => [[
                'data' => $espacios->map(function($espacio) {
                    return $espacio->reservas->count();
                })->toArray(),
                'backgroundColor' => [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                ]
            ]]
        ];
    }

    private function getTendenciaReservas()
    {
        $fechas = collect(range(0, 29))->map(function($dias) {
            return Carbon::now()->subDays($dias)->format('Y-m-d');
        });

        $reservas = Reserva::whereIn('fecha_inicio', $fechas)
            ->selectRaw('DATE(fecha_inicio) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->pluck('total', 'fecha');

        return [
            'labels' => $fechas->map(fn($fecha) => Carbon::parse($fecha)->format('d/m'))->toArray(),
            'datasets' => [[
                'label' => 'Tendencia de Reservas',
                'data' => $fechas->map(fn($fecha) => $reservas[$fecha] ?? 0)->toArray(),
                'borderColor' => 'rgb(75, 192, 192)',
                'tension' => 0.1
            ]]
        ];
    }

    private function getReservasPorMes($userId)
    {
        $meses = collect(range(5, 0))->map(function($meses) {
            return Carbon::now()->subMonths($meses)->format('Y-m');
        });

        $reservas = Reserva::where('user_id', $userId)
            ->whereIn(DB::raw('DATE_FORMAT(fecha_inicio, "%Y-%m")'), $meses)
            ->selectRaw('DATE_FORMAT(fecha_inicio, "%Y-%m") as mes, COUNT(*) as total')
            ->groupBy('mes')
            ->get()
            ->pluck('total', 'mes');

        return [
            'labels' => $meses->map(fn($mes) => Carbon::parse($mes)->format('M'))->toArray(),
            'datasets' => [[
                'label' => 'Mis reservas',
                'data' => $meses->map(fn($mes) => $reservas[$mes] ?? 0)->toArray(),
                'backgroundColor' => 'rgba(75, 192, 192, 0.5)',
                'borderColor' => 'rgb(75, 192, 192)',
                'borderWidth' => 1
            ]]
        ];
    }

    private function getDistribucionEspacios($userId)
    {
        $reservasPorEspacio = Reserva::where('user_id', $userId)
            ->join('espacios', 'reservas.espacio_id', '=', 'espacios.id')
            ->selectRaw('espacios.nombre, COUNT(*) as total')
            ->groupBy('espacios.id', 'espacios.nombre')
            ->get();

        return [
            'labels' => $reservasPorEspacio->pluck('nombre')->toArray(),
            'datasets' => [[
                'data' => $reservasPorEspacio->pluck('total')->toArray(),
                'backgroundColor' => [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                ]
            ]]
        ];
    }

    public function getProximasReservas($userId)
    {
        return Reserva::with(['espacio', 'escritorio'])
            ->where('user_id', $userId)
            ->where('fecha_inicio', '>=', Carbon::now())
            ->orderBy('fecha_inicio', 'asc')
            ->take(5)
            ->get()
            ->map(function ($reserva) {
                return [
                    'id' => $reserva->id,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'hora_inicio' => $reserva->hora_inicio,
                    'hora_fin' => $reserva->hora_fin,
                    'espacio' => $reserva->espacio->nombre,
                    'escritorio' => $reserva->escritorio ? $reserva->escritorio->numero : null,
                    'estado' => $reserva->estado
                ];
            });
    }

    public function getHistorialReservas($userId)
    {
        return Reserva::with(['espacio', 'escritorio'])
            ->where('user_id', $userId)
            ->where('fecha_inicio', '<', Carbon::now())
            ->orderBy('fecha_inicio', 'desc')
            ->take(5)
            ->get()
            ->map(function ($reserva) {
                return [
                    'id' => $reserva->id,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'hora_inicio' => $reserva->hora_inicio,
                    'hora_fin' => $reserva->hora_fin,
                    'espacio' => $reserva->espacio->nombre,
                    'escritorio' => $reserva->escritorio ? $reserva->escritorio->numero : null,
                    'estado' => $reserva->estado
                ];
            });
    }
}