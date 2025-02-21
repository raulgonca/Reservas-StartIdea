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
 * Controlador para la gestión de espacios y su disponibilidad
 */
class EspacioController extends Controller
{
    // Constantes para horarios
    private const HORA_INICIO = '08:00';
    private const HORA_FIN = '20:00';
    private const INTERVALO_MINUTOS = 60;

    /**
     * Muestra la lista de espacios activos en la página principal
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
     */
    public function getAvailability(Request $request, $id)
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
     * Genera los slots horarios para un día
     */
    private function generateTimeSlots($fecha, $reservas)
    {
        $slots = [];
        $inicio = Carbon::parse($fecha)->setTimeFromTimeString(self::HORA_INICIO);
        $fin = Carbon::parse($fecha)->setTimeFromTimeString(self::HORA_FIN);

        while ($inicio < $fin) {
            $slotFin = $inicio->copy()->addMinutes(self::INTERVALO_MINUTOS);
            
            // Verificar si el slot está ocupado
            $ocupado = $reservas->contains(function($reserva) use ($inicio, $slotFin) {
                $reservaInicio = Carbon::parse($reserva->fecha_inicio);
                $reservaFin = Carbon::parse($reserva->fecha_fin);
                return $reservaInicio < $slotFin && $reservaFin > $inicio;
            });

            $slots[] = [
                'hora_inicio' => $inicio->format('H:i'),
                'hora_fin' => $slotFin->format('H:i'),
                'disponible' => !$ocupado
            ];

            $inicio = $slotFin;
        }

        return $slots;
    }

    /**
     * Obtiene la disponibilidad diaria del espacio
     */
    private function getDayAvailability($espacio, $fecha, $escritorio_id = null)
    {
        // Obtener reservas del día
        $query = Reserva::where('espacio_id', $espacio->id)
            ->whereDate('fecha_inicio', '<=', $fecha)
            ->whereDate('fecha_fin', '>=', $fecha)
            ->whereIn('estado', ['confirmada', 'pendiente']);

        if ($escritorio_id && $espacio->tipo === 'coworking') {
            $query->where('escritorio_id', $escritorio_id);
        }

        $reservas = $query->get();

        // Para espacios coworking
        if ($espacio->tipo === 'coworking') {
            return $this->getCoworkingDayAvailability($espacio, $fecha, $reservas);
        }

        // Para otros tipos de espacios
        $slots = $this->generateTimeSlots($fecha, $reservas);
        $occupancyData = $this->getOccupancyStatus($reservas, $fecha);

        return response()->json([
            'slots' => $slots,
            'status' => $occupancyData['status'],
            'occupancyPercentage' => $occupancyData['percentage']
        ]);
    }

    /**
     * Obtiene la disponibilidad diaria para espacios coworking
     */
    private function getCoworkingDayAvailability($espacio, $fecha, $reservas)
    {
        $escritorios = $espacio->escritorios()->get();
        $escritoriosData = [];

        foreach ($escritorios as $escritorio) {
            $escritorioReservas = $reservas->where('escritorio_id', $escritorio->id);
            $slots = $this->generateTimeSlots($fecha, $escritorioReservas);
            $occupancyData = $this->getOccupancyStatus($escritorioReservas, $fecha);

            $escritoriosData[] = [
                'id' => $escritorio->id,
                'numero' => $escritorio->numero,
                'status' => $occupancyData['status'],
                'occupancyPercentage' => $occupancyData['percentage'],
                'slots' => $slots
            ];
        }

        return response()->json([
            'escritorios' => $escritoriosData
        ]);
    }

    /**
     * Obtiene la disponibilidad semanal del espacio
     */
    private function getWeekAvailability($espacio, $fecha, $escritorio_id = null)
    {
        $weekStart = $fecha->copy()->startOfWeek();
        $weekEnd = $fecha->copy()->endOfWeek();
        $weekAvailability = [];

        for ($day = $weekStart->copy(); $day <= $weekEnd; $day->addDay()) {
            $query = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $day)
                ->whereDate('fecha_fin', '>=', $day)
                ->whereIn('estado', ['confirmada', 'pendiente']);

            if ($escritorio_id && $espacio->tipo === 'coworking') {
                $query->where('escritorio_id', $escritorio_id);
            }

            $dayReservas = $query->get();
            $occupancyData = $this->getOccupancyStatus($dayReservas, $day);
            
            $weekAvailability[$day->format('Y-m-d')] = [
                'status' => $occupancyData['status'],
                'occupancyPercentage' => $occupancyData['percentage'],
                'reservas' => $this->formatReservas($dayReservas)
            ];
        }

        $response = ['weekAvailability' => $weekAvailability];

        if ($espacio->tipo === 'coworking') {
            $response['escritorios'] = $espacio->escritorios()
                ->get()
                ->map(fn($escritorio) => [
                    'id' => $escritorio->id,
                    'numero' => $escritorio->numero
                ]);
        }

        return response()->json($response);
    }

    /**
     * Obtiene la disponibilidad mensual del espacio
     */
    private function getMonthAvailability($espacio, $fecha, $escritorio_id = null)
    {
        $monthStart = $fecha->copy()->startOfMonth();
        $monthEnd = $fecha->copy()->endOfMonth();
        $monthAvailability = [];

        for ($day = $monthStart->copy(); $day <= $monthEnd; $day->addDay()) {
            $query = Reserva::where('espacio_id', $espacio->id)
                ->whereDate('fecha_inicio', '<=', $day)
                ->whereDate('fecha_fin', '>=', $day)
                ->whereIn('estado', ['confirmada', 'pendiente']);

            if ($escritorio_id && $espacio->tipo === 'coworking') {
                $query->where('escritorio_id', $escritorio_id);
            }

            $dayReservas = $query->get();
            $occupancyData = $this->getOccupancyStatus($dayReservas, $day);
            
            $monthAvailability[$day->format('Y-m-d')] = [
                'status' => $occupancyData['status'],
                'occupancyPercentage' => $occupancyData['percentage'],
                'reservas' => $this->formatReservas($dayReservas)
            ];
        }

        $response = ['monthAvailability' => $monthAvailability];

        if ($espacio->tipo === 'coworking') {
            $response['escritorios'] = $espacio->escritorios()
                ->get()
                ->map(fn($escritorio) => [
                    'id' => $escritorio->id,
                    'numero' => $escritorio->numero
                ]);
        }

        return response()->json($response);
    }

    /**
     * Calcula el estado de ocupación de un día
     */
    private function getOccupancyStatus($reservas, $day)
    {
        if ($reservas->isEmpty()) {
            return [
                'status' => 'free',
                'percentage' => 0
            ];
        }

        $inicio = Carbon::parse($day)->setTimeFromTimeString(self::HORA_INICIO);
        $fin = Carbon::parse($day)->setTimeFromTimeString(self::HORA_FIN);
        $totalMinutos = $inicio->diffInMinutes($fin);
        $minutosOcupados = 0;

        foreach ($reservas as $reserva) {
            $reservaInicio = Carbon::parse($reserva->fecha_inicio)
                ->setDate($day->year, $day->month, $day->day)
                ->max($inicio);
            $reservaFin = Carbon::parse($reserva->fecha_fin)
                ->setDate($day->year, $day->month, $day->day)
                ->min($fin);
            
            if ($reservaFin > $reservaInicio) {
                $minutosOcupados += $reservaInicio->diffInMinutes($reservaFin);
            }
        }

        $occupancyPercentage = ($minutosOcupados / $totalMinutos) * 100;

        if ($occupancyPercentage >= 100) {
            return [
                'status' => 'occupied',
                'percentage' => 100
            ];
        }

        return [
            'status' => $occupancyPercentage > 0 ? 'partial' : 'free',
            'percentage' => round($occupancyPercentage, 2)
        ];
    }

    /**
     * Formatea las reservas para la respuesta JSON
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
}