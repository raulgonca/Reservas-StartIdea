<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Log;

class EspacioController extends Controller
{
    public function index()
    {
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
                // Log para depuración
                Log::info('Procesando espacio:', [
                    'id' => $espacio->id,
                    'nombre' => $espacio->nombre,
                    'image_path' => $espacio->image,
                    'image_url' => asset('storage/' . $espacio->image)
                ]);

                return [
                    'id' => $espacio->id,
                    'nombre' => $espacio->nombre,
                    'slug' => $espacio->slug,
                    'descripcion' => $espacio->descripcion,
                    'image_url' => asset('storage/' . $espacio->image),
                    'features' => json_decode($espacio->features, true) ?? [],
                    'aforo' => $espacio->aforo,
                    'price' => $espacio->price
                ];
            });

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

    public function show($slug)
    {
        $espacio = Espacio::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Espacios/Show', [
            'espacio' => $espacio
        ]);
    }
}