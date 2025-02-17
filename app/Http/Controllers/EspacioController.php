<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;


class EspacioController extends Controller
{
    public function index()
    {
        $espacios = Espacio::where('is_active', true)
            ->select(
                'id',
                'nombre as title',
                'slug',
                'descripcion as description',
                'image',
                'features',
                'aforo as capacity',
                'price'
            )
            ->get()
            ->map(function ($espacio) {
                $espacio->features = json_decode($espacio->features, true) ?? [];
                return $espacio;
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