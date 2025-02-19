<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
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
                'price'
            )
            ->get()
            ->map(function ($espacio) {
                // Transforma cada espacio al formato requerido por el frontend
                return [
                    'id' => $espacio->id,
                    'nombre' => $espacio->nombre,
                    'slug' => $espacio->slug,
                    'descripcion' => $espacio->descripcion,
                    'image_url' => $espacio->image_url,
                    'gallery_media' => $espacio->gallery_media,
                    'features' => json_decode($espacio->features, true) ?? [],
                    'aforo' => $espacio->aforo,
                    'price' => $espacio->price
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
}