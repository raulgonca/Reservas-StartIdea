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
use Illuminate\Validation\ValidationException;

class ReservaController extends Controller
{
    protected $reservaService;

    /**
     * Constructor que inyecta el servicio de reservas
     */
    public function __construct(ReservaService $reservaService)
    {
        $this->reservaService = $reservaService;
    }

    /**
     * Muestra el listado de reservas
     */
    public function index()
    {
        $reservas = Reserva::with(['user', 'espacio', 'escritorio'])->get();
        return Inertia::render('ReservasCrud/ReservasList', [
            'reservas' => $reservas,
        ]);
    }

    /**
     * Muestra el formulario de creación
     */
    public function create()
    {
        return Inertia::render('ReservasCrud/CreateReserva', [
            'users' => User::all(),
            'espacios' => Espacio::all(),
            'reservas' => Reserva::all(),
            'escritorios' => Escritorio::all(),
        ]);
    }

    /**
     * Almacena una nueva reserva
     */
    public function store(Request $request)
    {
        try {
            $data = $this->reservaService->validateAndPrepareData($request->all());
            $this->reservaService->checkOverlap($data);

            $reserva = Reserva::create($data);

            // Obtener información adicional para el mensaje
            $usuario = User::find($data['user_id']);
            $espacio = Espacio::find($data['espacio_id']);

            // Construir el mensaje de éxito
            $mensajeExito = [
                "Reserva creada exitosamente!",
                "Usuario: {$usuario->name}",
                "Email: {$usuario->email}",
                "Espacio: {$espacio->nombre}"
            ];

            if ($reserva->escritorio_id) {
                $escritorio = Escritorio::find($reserva->escritorio_id);
                $mensajeExito[] = "Escritorio: {$escritorio->nombre}";
            }

            $mensajeExito = array_merge($mensajeExito, [
                "Fecha de Inicio: {$reserva->fecha_inicio->format('d/m/Y H:i')}",
                "Fecha de Fin: {$reserva->fecha_fin->format('d/m/Y H:i')}",
                "Tipo de Reserva: {$reserva->tipo_reserva}"
            ]);

            if ($reserva->motivo) {
                $mensajeExito[] = "Motivo: {$reserva->motivo}";
            }

            return back()->with('success', implode("\n", $mensajeExito));
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error al crear reserva:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Error al crear la reserva.'])->withInput();
        }
    }

    /**
     * Muestra el formulario de edición
     */
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

    /**
     * Actualiza una reserva existente
     */
    public function update(Request $request, $id)
{
    try {
        // Buscar la reserva explícitamente
        $reserva = Reserva::findOrFail($id);
        
        Log::info('Datos recibidos en update:', [
            'request_data' => $request->all(),
            'reserva_id' => $id,
            'reserva_encontrada' => !is_null($reserva)
        ]);

        if ($request->has('is_status_update')) {
            $validatedData = $request->validate([
                'estado' => 'required|in:pendiente,confirmada,cancelada',
                'motivo' => 'nullable|string|max:255'
            ]);

            Log::info('Antes de actualizar:', [
                'reserva_id' => $id,
                'estado_actual' => $reserva->estado,
                'nuevo_estado' => $validatedData['estado']
            ]);

            $updated = $reserva->update([
                'estado' => $validatedData['estado'],
                'motivo' => $validatedData['motivo'] ?? ''
            ]);

            Log::info('Estado actualizado:', [
                'reserva_id' => $id,
                'actualizado' => $updated,
                'estado' => $reserva->fresh()->estado
            ]);

            return response()->json([
                'message' => "¡Estado actualizado a '{$validatedData['estado']}' exitosamente!",
                'reserva' => $reserva->fresh()
            ]);
        }

        // ... resto del código para actualización completa ...

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        Log::error('Reserva no encontrada:', ['id' => $id]);
        return response()->json([
            'message' => 'No se encontró la reserva especificada.'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Error en actualización:', [
            'error' => $e->getMessage(),
            'id' => $id
        ]);
        return response()->json([
            'message' => 'Error al actualizar la reserva: ' . $e->getMessage()
        ], 500);
    }
}

    protected function handleFullUpdate(Request $request, Reserva $reserva)
    {
        // Mover la lógica de actualización completa aquí
        $data = $this->reservaService->validateAndPrepareData($request->all(), true, $reserva);
        $this->reservaService->checkOverlap($data, $reserva->id);
        $reserva->update($data);

        return response()->json([
            'message' => '¡Reserva actualizada exitosamente!'
        ]);
    }

    /**
     * Construye el mensaje de éxito para la actualización
     */
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

    /**
     * Elimina una reserva
     */
    public function destroy($id)
    {
        try {
            $reserva = Reserva::findOrFail($id);
            $reserva->delete();

            return redirect()
                ->route('superadmin.reservas.index')
                ->with('success', 'Reserva eliminada exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar reserva:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Error al eliminar la reserva.']);
        }
    }
}
