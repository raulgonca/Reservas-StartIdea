<?php

namespace App\Http\Controllers\Reservas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\Reservas\CalendarioService;
use Illuminate\Support\Facades\Log;

class CalendarioController extends Controller
{
    protected $calendarioService;

    public function __construct(CalendarioService $calendarioService)
    {
        $this->calendarioService = $calendarioService;
    }

    public function index()
    {
        try {
            $user = Auth::user();
            $fecha = now();
            
            return Inertia::render('Reservas/Index', [
                'escritorios' => $this->calendarioService->getEscritorios($fecha),
                'weekData' => $this->calendarioService->getWeekData($fecha),
                'monthData' => $this->calendarioService->getMonthData($fecha)
            ]);

        } catch (\Exception $e) {
            Log::error('Error al cargar el calendario:', [
                'error' => $e->getMessage(),
                'user' => Auth::id()
            ]);
            
            return back()->withErrors(['error' => 'Error al cargar el calendario de reservas.']);
        }
    }
}