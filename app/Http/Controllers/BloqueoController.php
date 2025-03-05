<?php

namespace App\Http\Controllers;

use App\Models\Bloqueo;
use App\Models\Espacio;
use App\Models\Escritorio;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class BloqueoController extends Controller
{
    /**
     * Display a listing of the bloqueos.
     */
    public function index()
    {
        $bloqueos = Bloqueo::with(['espacio', 'escritorio', 'creadoPor'])->get();
        
        $role = Auth::user()->role;
        $viewName = $role === 'superadmin' ? 'BloqueosCrud/BloqueosList' : 'BloqueosCrud/BloqueosList';
        
        return Inertia::render($viewName, [
            'bloqueos' => $bloqueos
        ]);
    }

    /**
     * Show the form for creating a new bloqueo.
     */
    public function create()
    {
        $espacios = Espacio::all();
        $escritorios = Escritorio::all();
        
        $role = Auth::user()->role;
        $viewName = $role === 'superadmin' ? 'BloqueosCrud/CreateBloqueo' : 'BloqueosCrud/CreateBloqueo';
        
        return Inertia::render($viewName, [
            'espacios' => $espacios,
            'escritorios' => $escritorios
        ]);
    }

    /**
     * Store a newly created bloqueo in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'motivo' => 'required|string',
        ]);

        // Al menos uno de estos debe estar presente
        if (!$request->espacio_id && !$request->escritorio_id) {
            return back()->withErrors(['error' => 'Debe seleccionar un espacio o un escritorio.']);
        }

        // Verificar solapamientos
        if (!$this->verificarDisponibilidad($request)) {
            return back()->withErrors(['error' => 'Ya existe una reserva o bloqueo en ese horario.']);
        }

        $bloqueo = new Bloqueo();
        $bloqueo->espacio_id = $request->espacio_id;
        $bloqueo->escritorio_id = $request->escritorio_id;
        $bloqueo->fecha_inicio = $request->fecha_inicio;
        $bloqueo->fecha_fin = $request->fecha_fin;
        $bloqueo->motivo = $request->motivo;
        $bloqueo->creado_por = Auth::id();
        $bloqueo->save();

        $role = Auth::user()->role;
        $redirectRoute = $role === 'superadmin' ? 'superadmin.bloqueos.index' : 'admin.bloqueos.index';
        
        return redirect()->route($redirectRoute)->with('success', 'Bloqueo creado exitosamente.');
    }

    /**
     * Display the specified bloqueo.
     */
    public function show(Bloqueo $bloqueo)
    {
        $bloqueo->load(['espacio', 'escritorio', 'creadoPor']);
        
        $role = Auth::user()->role;
        $viewName = $role === 'superadmin' ? 'BloqueosCrud/ShowBloqueo' : 'BloqueosCrud/ShowBloqueo';
        
        return Inertia::render($viewName, [
            'bloqueo' => $bloqueo
        ]);
    }

    /**
     * Show the form for editing the specified bloqueo.
     */
    public function edit(Bloqueo $bloqueo)
    {
        $espacios = Espacio::all();
        $escritorios = Escritorio::all();
        
        $role = Auth::user()->role;
        $viewName = $role === 'superadmin' ? 'BloqueosCrud/EditBloqueo' : 'BloqueosCrud/EditBloqueo';
        
        return Inertia::render($viewName, [
            'bloqueo' => $bloqueo,
            'espacios' => $espacios,
            'escritorios' => $escritorios
        ]);
    }

    /**
     * Update the specified bloqueo in storage.
     */
    public function update(Request $request, Bloqueo $bloqueo)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'motivo' => 'required|string',
        ]);

        // Al menos uno de estos debe estar presente
        if (!$request->espacio_id && !$request->escritorio_id) {
            return back()->withErrors(['error' => 'Debe seleccionar un espacio o un escritorio.']);
        }

        // Verificar solapamientos (excluyendo el bloqueo actual)
        if (!$this->verificarDisponibilidad($request, $bloqueo->id)) {
            return back()->withErrors(['error' => 'Ya existe una reserva o bloqueo en ese horario.']);
        }

        $bloqueo->espacio_id = $request->espacio_id;
        $bloqueo->escritorio_id = $request->escritorio_id;
        $bloqueo->fecha_inicio = $request->fecha_inicio;
        $bloqueo->fecha_fin = $request->fecha_fin;
        $bloqueo->motivo = $request->motivo;
        $bloqueo->save();

        $role = Auth::user()->role;
        $redirectRoute = $role === 'superadmin' ? 'superadmin.bloqueos.index' : 'admin.bloqueos.index';
        
        return redirect()->route($redirectRoute)->with('success', 'Bloqueo actualizado exitosamente.');
    }

    /**
     * Remove the specified bloqueo from storage.
     */
    public function destroy(Bloqueo $bloqueo)
    {
        $bloqueo->delete();
        
        $role = Auth::user()->role;
        $redirectRoute = $role === 'superadmin' ? 'superadmin.bloqueos.index' : 'admin.bloqueos.index';
        
        return redirect()->route($redirectRoute)->with('success', 'Bloqueo eliminado exitosamente.');
    }

    /**
     * Verify if there's no overlap with existing reservations or bloqueos.
     */
    protected function verificarDisponibilidad(Request $request, $bloqueoId = null)
    {
        $fechaInicio = Carbon::parse($request->fecha_inicio);
        $fechaFin = Carbon::parse($request->fecha_fin);
        $espacio_id = $request->espacio_id;
        $escritorio_id = $request->escritorio_id;

        // Verificar solapamientos con reservas
        $reservasQuery = Reserva::where('estado', 'confirmada')
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                    ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                    ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                        $q->where('fecha_inicio', '<=', $fechaInicio)
                          ->where('fecha_fin', '>=', $fechaFin);
                    });
            });

        if ($espacio_id) {
            $reservasQuery->where('espacio_id', $espacio_id);
        }

        if ($escritorio_id) {
            $reservasQuery->where('escritorio_id', $escritorio_id);
        }

        if ($reservasQuery->exists()) {
            return false;
        }

        // Verificar solapamientos con otros bloqueos
        $bloqueosQuery = Bloqueo::where(function ($query) use ($fechaInicio, $fechaFin) {
            $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                    $q->where('fecha_inicio', '<=', $fechaInicio)
                      ->where('fecha_fin', '>=', $fechaFin);
                });
        });

        if ($espacio_id) {
            $bloqueosQuery->where('espacio_id', $espacio_id);
        }

        if ($escritorio_id) {
            $bloqueosQuery->where('escritorio_id', $escritorio_id);
        }

        // Excluir el bloqueo actual en caso de actualización
        if ($bloqueoId) {
            $bloqueosQuery->where('id', '!=', $bloqueoId);
        }

        if ($bloqueosQuery->exists()) {
            return false;
        }

        return true;
    }
}