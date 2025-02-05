<?php

namespace App\Http\Controllers;

use App\Models\Bloqueo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BloqueoController extends Controller
{
    public function index()
    {
        $bloqueos = Bloqueo::all();
        return Inertia::render('Bloqueos/Index', [
            'bloqueos' => $bloqueos,
        ]);
    }

    public function show($id)
    {
        $bloqueo = Bloqueo::findOrFail($id);
        return Inertia::render('Bloqueos/Show', [
            'bloqueo' => $bloqueo,
        ]);
    }

    public function create()
    {
        return Inertia::render('Bloqueos/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'motivo' => 'nullable|string',
        ]);

        Bloqueo::create($request->all());

        return redirect()->route('v1.bloqueos.index')->with('success', 'Bloqueo creado exitosamente.');
    }
}