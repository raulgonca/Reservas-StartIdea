<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use App\Services\ReservaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class ReservaController extends Controller
{
    protected $reservaService;

    public function __construct(ReservaService $reservaService)
    {
        $this->reservaService = $reservaService;
    }

    public function index()
{
    $user = Auth::user(); 

    // Si el usuario es admin o superadmin, mostrar todas las reservas
    if ($user->role === 'admin' || $user->role === 'superadmin') {
        $reservas = Reserva::with(['user', 'espacio', 'escritorio'])
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        return Inertia::render('ReservasCrud/ReservasList', [
            'reservas' => $reservas,
        ]);
    }

    // Si es usuario normal, mostrar solo sus reservas
    $reservas = Reserva::where('user_id', $user->id)
        ->with(['espacio', 'escritorio'])
        ->orderBy('fecha_inicio', 'desc')
        ->get();

    return Inertia::render('Users/ReservasUser', [
        'reservas' => $reservas,
    ]);
}

    public function create()
    {
        return Inertia::render('ReservasCrud/CreateReserva', [
            'users' => User::all(),
            'espacios' => Espacio::all(),
            'reservas' => Reserva::all(),
            'escritorios' => Escritorio::all(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $data = $this->reservaService->validateAndPrepareData($request->all());
            $this->reservaService->checkOverlap($data);

            $reserva = Reserva::create($data);
            $mensajeExito = $this->buildSuccessMessage($reserva);

            return back()->with('success', implode("\n", $mensajeExito));
        } catch (ValidationException $e) {
            Log::warning('Error de validación en creación:', [
                'errors' => $e->errors()
            ]);
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error al crear reserva:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Error al crear la reserva.'])->withInput();
        }
    }

    public function edit($id)
    {
        $reserva = Reserva::with(['user', 'espacio', 'escritorio'])->findOrFail($id);
        return Inertia::render('ReservasCrud/ReservaEdit', [
            'reserva' => $reserva,
            'users' => User::all(),
            'espacios' => Espacio::all(),
            'escritorios' => Escritorio::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $reserva = Reserva::findOrFail($id);
            
            Log::info('Datos recibidos en update:', [
                'request_data' => $request->all(),
                'reserva_id' => $id,
                'is_status_update' => $request->boolean('is_status_update')
            ]);

            if ($request->boolean('is_status_update')) {
                return $this->handleStatusUpdate($request, $reserva);
            }

            return $this->handleFullUpdate($request, $reserva);

        } catch (ValidationException $e) {
            Log::warning('Error de validación en actualización:', [
                'reserva_id' => $id,
                'errors' => $e->errors()
            ]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en actualización:', [
                'reserva_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'errors' => ['general' => 'Error al actualizar la reserva: ' . $e->getMessage()]
            ], 500);
        }
    }

    protected function handleStatusUpdate(Request $request, Reserva $reserva)
    {
        $validatedData = $request->validate([
            'estado' => 'required|in:pendiente,confirmada,cancelada',
            'motivo' => 'nullable|string|max:255'
        ], [
            'estado.required' => 'El estado es requerido.',
            'estado.in' => 'El estado seleccionado no es válido.',
            'motivo.max' => 'El motivo no puede exceder los 255 caracteres.'
        ]);

        $reserva->update($validatedData);
        
        Log::info('Estado actualizado correctamente', [
            'reserva_id' => $reserva->id,
            'nuevo_estado' => $validatedData['estado']
        ]);

        return response()->json([
            'message' => "¡Estado actualizado a '{$validatedData['estado']}' exitosamente!",
            'reserva' => $reserva->fresh()
        ]);
    }

    protected function handleFullUpdate(Request $request, Reserva $reserva)
    {
        try {
            $updateData = $request->all();
            
            // Validar y preparar datos
            $data = $this->reservaService->validateAndPrepareData($updateData, true);
            
            // Verificar solapamiento
            $this->reservaService->checkOverlap($data, $reserva->id);
            
            // Actualizar la reserva
            $reserva->update($data);

            Log::info('Reserva actualizada correctamente', [
                'reserva_id' => $reserva->id,
                'datos_actualizados' => $data
            ]);

            return response()->json([
                'message' => '¡Reserva actualizada correctamente!',
                'reserva' => $reserva->fresh()
            ]);

        } catch (ValidationException $e) {
            Log::warning('Error de validación en actualización completa', [
                'reserva_id' => $reserva->id,
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error en actualización completa', [
                'reserva_id' => $reserva->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    protected function buildSuccessMessage($reserva)
    {
        $mensajeExito = [
            "¡Reserva actualizada exitosamente!",
            "Usuario: {$reserva->user->name}",
            "Email: {$reserva->user->email}",
            "Espacio: {$reserva->espacio->nombre}"
        ];

        if ($reserva->escritorio_id) {
            $mensajeExito[] = "Escritorio: {$reserva->escritorio->nombre}";
        }

        $mensajeExito = array_merge($mensajeExito, [
            "Fecha de Inicio: {$reserva->fecha_inicio->format('d/m/Y H:i')}",
            "Fecha de Fin: {$reserva->fecha_fin->format('d/m/Y H:i')}",
            "Tipo de Reserva: {$reserva->tipo_reserva}",
            "Estado: {$reserva->estado}"
        ]);

        if ($reserva->motivo) {
            $mensajeExito[] = "Motivo: {$reserva->motivo}";
        }

        return $mensajeExito;
    }

    public function destroy($id)
    {
        try {
            $reserva = Reserva::findOrFail($id);
            $reserva->delete();

            Log::info('Reserva eliminada correctamente', [
                'reserva_id' => $id
            ]);

            return redirect()
                ->route('superadmin.reservas.index')
                ->with('success', 'Reserva eliminada exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar reserva:', [
                'reserva_id' => $id,
                'error' => $e->getMessage()
            ]);
            return back()->withErrors(['error' => 'Error al eliminar la reserva.']);
        }
    }
}