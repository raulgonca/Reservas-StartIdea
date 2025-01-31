<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EspacioController extends Controller
{
    public function index()
    {
        $espacios = Espacio::all();
        return Inertia::render('Espacios/Index', [
            'espacios' => $espacios,
        ]);
    }

    public function show($id)
    {
        $espacio = Espacio::findOrFail($id);
        return Inertia::render('Espacios/Show', [
            'espacio' => $espacio,
        ]);
    }
}