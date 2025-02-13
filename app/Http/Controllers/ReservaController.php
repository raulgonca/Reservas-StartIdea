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
use App\Notifications\NuevaReservaNotification;
use Illuminate\Support\Facades\Mail;
/**
 * Controlador para gestionar las reservas
 * 
 * Maneja la creación, actualización, visualización y eliminación de reservas,
 * incluyendo la lógica de notificaciones y validaciones.
 */
class ReservaController extends Controller
{
    /** @var ReservaService */
    protected $reservaService;

    /**
     * Constructor del controlador
     * 
     * @param ReservaService $reservaService Servicio para la lógica de negocio de reservas
     */
    public function __construct(ReservaService $reservaService)
    {
        $this->reservaService = $reservaService;
    }

    /**
     * Muestra el listado de reservas según el rol del usuario
     * 
     * @return \Inertia\Response Vista con el listado de reservas
     */
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

    /**
     * Muestra el formulario de creación de reserva
     * 
     * @return \Inertia\Response Vista del formulario
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
 * 
 * @param Request $request Datos de la reserva
 * @return \Illuminate\Http\RedirectResponse
 */
/**
 * Almacena una nueva reserva
 */
public function store(Request $request)
{
    try {
        // Preparar los datos y validar
        $data = $this->reservaService->validateAndPrepareData($request->all());

        // Si es usuario normal, forzar estado pendiente
        if (Auth::check() && Auth::user()->role === 'user') {
            $data['estado'] = 'pendiente';
        }

        // Verificar solapamiento
        $this->reservaService->checkOverlap($data);

        // Crear la reserva
        $reserva = Reserva::create($data);

        // Enviar notificación solo si es un usuario normal
        if (Auth::user()->role === 'user') {
            Log::info('Iniciando envío de notificación', [
                'user_role' => Auth::user()->role,
                'notification_email' => config('reservas.notification_email'),
                'reserva_id' => $reserva->id
            ]);

            try {
                Mail::send('emails.nueva-reserva', ['reserva' => $reserva], function ($message) use ($reserva) {
                    $message
                        ->to(config('reservas.notification_email'))
                        ->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject('Nueva Reserva: ' . $reserva->espacio->nombre);
                });
            
                Log::info('Notificación enviada correctamente', [
                    'reserva_id' => $reserva->id,
                    'email' => config('reservas.notification_email')
                ]);
            } catch (\Exception $e) {
                Log::error('Error enviando notificación', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }

            $mensajeExito = [
                "¡Reserva creada exitosamente!",
                "Su reserva está pendiente de confirmación.",
                "Nuestro equipo revisará su solicitud y se pondrá en contacto con usted.",
                "",
                "Detalles de su reserva:"
            ];
        } else {
            $mensajeExito = ["¡Reserva creada exitosamente!", ""];
        }

        // Agregar detalles de la reserva al mensaje
        $mensajeExito = array_merge($mensajeExito, $this->buildSuccessMessage($reserva));

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











    /**
     * Muestra el formulario de edición de una reserva
     * 
     * @param int $id ID de la reserva
     * @return \Inertia\Response Vista del formulario de edición
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
     * 
     * @param Request $request Datos de actualización
     * @param int $id ID de la reserva
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Maneja la actualización del estado de una reserva
     * 
     * @param Request $request Datos de actualización
     * @param Reserva $reserva Reserva a actualizar
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Maneja la actualización completa de una reserva
     * 
     * @param Request $request Datos de actualización
     * @param Reserva $reserva Reserva a actualizar
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Construye el mensaje de éxito para una reserva
     * 
     * @param Reserva $reserva Reserva para la que se construye el mensaje
     * @return array Array con las líneas del mensaje
     */
    protected function buildSuccessMessage($reserva)
    {
        $mensajeBase = [];

        // Información básica
        $mensajeBase[] = "Espacio: {$reserva->espacio->nombre}";

        // Información de escritorio si existe
        if ($reserva->escritorio_id) {
            $mensajeBase[] = "Escritorio: {$reserva->escritorio->nombre}";
        }

        // Fechas y horarios
        $mensajeBase[] = "Fecha: {$reserva->fecha_inicio->format('d/m/Y')}";

        // Agregar hora solo si es relevante
        if (in_array($reserva->tipo_reserva, ['hora', 'medio_dia'])) {
            $horaInfo = "Hora: {$reserva->hora_inicio}";
            if ($reserva->hora_fin) {
                $horaInfo .= " a {$reserva->hora_fin}";
            }
            $mensajeBase[] = $horaInfo;
        }

        // Tipo de reserva y estado
        $mensajeBase[] = "Tipo de Reserva: " . ucfirst($reserva->tipo_reserva);
        $mensajeBase[] = "Estado: " . ucfirst($reserva->estado);

        // Motivo si existe
        if ($reserva->motivo) {
            $mensajeBase[] = "Motivo: {$reserva->motivo}";
        }

        return $mensajeBase;
    }

    /**
     * Elimina una reserva
     * 
     * @param int $id ID de la reserva a eliminar
     * @return \Illuminate\Http\RedirectResponse
     */
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
