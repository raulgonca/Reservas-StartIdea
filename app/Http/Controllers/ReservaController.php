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

        if ($user->role === 'admin' || $user->role === 'superadmin') {
            $reservas = Reserva::with(['user', 'espacio', 'escritorio'])
                ->orderBy('fecha_inicio', 'desc')
                ->get();

            return Inertia::render('ReservasCrud/ReservasList', [
                'reservas' => $reservas,
            ]);
        }

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
            }

            $mensajeExito = $this->buildSuccessMessage($reserva);

            return redirect()->route('superadmin.reservas.index')->with('success', $mensajeExito);
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

            $data = $this->reservaService->validateAndPrepareData($updateData, true);

            $this->reservaService->checkOverlap($data, $reserva->id);

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
     * Construye el mensaje de éxito para una reserva según el rol del usuario
     * 
     * @param Reserva $reserva Reserva para la que se construye el mensaje
     * @return string Mensaje de éxito
     */
    protected function buildSuccessMessage(Reserva $reserva)
{
    if (Auth::user()->role === 'user') {
        $mensaje = [
            "Su reserva será revisada por el equipo de la empresa y pronto nos comunicaremos con usted.",
            "",
            "Detalles de su reserva pendiente:",
            "Espacio: " . $reserva->espacio->nombre
        ];

        // Agregar información del escritorio si es coworking
        if ($reserva->escritorio_id) {
            $mensaje[] = "Escritorio: " . $reserva->escritorio->nombre;
        }

        // Fechas según tipo de reserva
        $mensaje[] = "Fecha de inicio: " . $reserva->fecha_inicio->format('d/m/Y');
        
        if ($reserva->tipo_reserva !== 'dia_completo') {
            $mensaje[] = "Fecha de fin: " . $reserva->fecha_fin->format('d/m/Y');
        }

        // Agregar horarios si aplica
        if (in_array($reserva->tipo_reserva, ['hora', 'medio_dia'])) {
            $mensaje[] = "Hora de inicio: " . $reserva->hora_inicio;
            if ($reserva->hora_fin) {
                $mensaje[] = "Hora de fin: " . $reserva->hora_fin;
            }
        }

        // Tipo de reserva formateado
        $tiposReserva = [
            'hora' => 'Por hora',
            'medio_dia' => 'Medio día',
            'dia_completo' => 'Día completo',
            'semana' => 'Semana',
            'mes' => 'Mes'
        ];
        
        $mensaje[] = "Tipo de reserva: " . ($tiposReserva[$reserva->tipo_reserva] ?? $reserva->tipo_reserva);

        return implode("\n", $mensaje);
    } else {
        $mensajeBase = [];

        // Información básica
        $mensajeBase[] = "¡Reserva creada exitosamente!";
        $mensajeBase[] = "Usuario: {$reserva->user->name}";
        $mensajeBase[] = "Email: {$reserva->user->email}";
        $mensajeBase[] = "Espacio: {$reserva->espacio->nombre}";

        // Información de escritorio si existe
        if ($reserva->escritorio_id) {
            $mensajeBase[] = "Escritorio: {$reserva->escritorio->nombre}";
        }

        // Fechas y horarios
        $mensajeBase[] = "Fecha de Inicio: {$reserva->fecha_inicio->format('d/m/Y')}";
        $mensajeBase[] = "Fecha de Fin: {$reserva->fecha_fin->format('d/m/Y')}";

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

        return implode("\n", $mensajeBase);
    }
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
