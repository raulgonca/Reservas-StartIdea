<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log; // Importación correcta de Log
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
            'tipo' // Añadir el tipo
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
                'tipo' => $espacio->tipo // Incluir el tipo en la respuesta
            ];
        });

        // Renderiza la vista con los datos necesarios
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
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el espacio no existe o no está activo
     */
    public function show($slug)
    {
        // Busca el espacio activo por su slug
        $espacio = Espacio::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // Renderiza la vista de detalles del espacio
        return Inertia::render('Espacios/Show', [
            'espacio' => $espacio
        ]);
    }

    
    public function getAvailability(Request $request, $id)
    {
        try {
            $espacio = Espacio::findOrFail($id);
            $fecha = Carbon::parse($request->date);
            
            Log::info('Consultando disponibilidad', [
                'espacio_id' => $id,
                'fecha' => $fecha->toDateString(),
                'tipo_espacio' => $espacio->tipo
            ]);
            
            // Si es un espacio de coworking, devolver disponibilidad de escritorios
            if ($espacio->tipo === 'coworking') {
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

                Log::info('Disponibilidad de escritorios', [
                    'cantidad' => $escritorios->count(),
                    'escritorios' => $escritorios->toArray()
                ]);

                return response()->json(['escritorios' => $escritorios]);
            }

            // Para otros tipos de espacios, mostrar slots de tiempo
            $slots = [];
            $horaInicio = Carbon::parse($espacio->horario_inicio);
            $horaFin = Carbon::parse($espacio->horario_fin);

            while ($horaInicio < $horaFin) {
                $slotOcupado = Reserva::where('espacio_id', $id)
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

            Log::info('Disponibilidad de slots', [
                'cantidad_slots' => count($slots)
            ]);

            return response()->json(['slots' => $slots]);

        } catch (\Exception $e) {
            Log::error('Error en getAvailability: ' . $e->getMessage(), [
                'espacio_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error al obtener disponibilidad'], 500);
        }
    }



    
}