<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReservaController extends Controller
{
    // Método para mostrar la lista de reservas
    public function index()
    {
        $reservas = Reserva::with(['user', 'espacio', 'escritorio'])->get();
        return Inertia::render('ReservasCrud/ReservasList', [
            'reservas' => $reservas,
        ]);
    }

    // Método para mostrar el formulario de creación de reservas
    public function create()
    {
        $users = User::all();
        $espacios = Espacio::all();
        $reservas = Reserva::all();
        $escritorios = Escritorio::all(); // Obtener todos los escritorios

        // Enviar los datos a Inertia
        return Inertia::render('ReservasCrud/CreateReserva', [
            'users' => $users,
            'espacios' => $espacios,
            'reservas' => $reservas,
            'escritorios' => $escritorios,
        ]);
    }


    public function store(Request $request)
    {
        // Limpiar campos no necesarios según tipo de reserva
        if (in_array($request->tipo_reserva, ['dia_completo', 'semana', 'mes'])) {
            $request->merge([
                'hora_inicio' => null,
                'hora_fin' => null
            ]);
        }

        // Mensajes de error personalizados
        $messages = [
            'hora_fin.required_with' => 'La hora final es requerida cuando se especifica hora de inicio.',
            'hora_fin.after' => 'La hora final debe ser posterior a la hora de inicio.',
            'hora_inicio.in' => 'Para medio día debe seleccionar 08:00 o 14:00 o de 14:00 a 20:00 horas.',
            'fecha_inicio.after_or_equal' => 'La fecha no puede ser anterior al día actual.',
        ];

        // Validación base
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i|after:hora_inicio',
            'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
            'motivo' => 'nullable|string|max:255',
        ], $messages);

        // Reglas condicionales
        $validator->sometimes('hora_inicio', 'required|date_format:H:i', function ($input) {
            return in_array($input->tipo_reserva, ['hora', 'medio_dia']);
        });

        $validator->sometimes('hora_fin', 'required_with:hora_inicio|date_format:H:i|after:hora_inicio', function ($input) {
            return $input->tipo_reserva === 'hora';
        });

        $validator->sometimes('hora_inicio', 'in:08:00,14:00', function ($input) {
            return $input->tipo_reserva === 'medio_dia';
        });

        $validator->sometimes(['hora_inicio', 'hora_fin'], 'prohibited', function ($input) {
            return in_array($input->tipo_reserva, ['dia_completo', 'semana', 'mes']);
        });

        // Si la validación falla, regresar con errores
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Cálculo de rangos temporales según el tipo de reserva
        $tipoReserva = $request->tipo_reserva;
        $fechaInicio = Carbon::parse($request->fecha_inicio);

        switch ($tipoReserva) {
            case 'hora':
                $fechaInicio->setTimeFromTimeString($request->hora_inicio);
                $fechaFin = $fechaInicio->copy()->addHour()->subSecond();
                break;

            case 'medio_dia':
                $fechaInicio->setTimeFromTimeString($request->hora_inicio);
                $fechaFin = $fechaInicio->copy()->addHours(6)->subSecond();
                break;

            case 'dia_completo':
                $fechaInicio->startOfDay();
                $fechaFin = $fechaInicio->copy()->endOfDay();
                break;

            case 'semana':
                $fechaInicio->startOfDay();
                $fechaFin = $fechaInicio->copy()->addWeek()->subSecond();
                break;

            case 'mes':
                $fechaInicio->startOfDay();
                $fechaFin = $fechaInicio->copy()->endOfMonth();
                break;

            default:
                return back()->withErrors(['tipo_reserva' => 'Tipo de reserva no válido.']);
        }

        // Validación de solapamiento universal
        $solapamiento = Reserva::where('espacio_id', $request->espacio_id)
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->where('fecha_inicio', '<', $fechaFin)
                    ->where('fecha_fin', '>', $fechaInicio);
            })
            ->when($request->escritorio_id, function ($query) use ($request) {
                $query->where('escritorio_id', $request->escritorio_id);
            })
            ->first();

        // Si hay solapamiento, regresar con error
        if ($solapamiento) {
            $mensajeError = "El espacio ya está reservado desde " .
                $solapamiento->fecha_inicio->format('d/m/Y H:i') . " hasta " .
                $solapamiento->fecha_fin->format('d/m/Y H:i') . ". Lo sentimos, seleccione otra hora u otro espacio.";

            Log::error('Solapamiento detectado', [
                'nueva_reserva' => $fechaInicio->format('Y-m-d H:i') . ' - ' . $fechaFin->format('Y-m-d H:i'),
                'conflicto' => $solapamiento->only(['fecha_inicio', 'fecha_fin'])
            ]);

            return back()->withErrors(['solapamiento' => $mensajeError])->withInput();
        }

        // Crear la reserva
        $reserva = Reserva::create([
            'user_id' => $request->user_id,
            'espacio_id' => $request->espacio_id,
            'escritorio_id' => $request->escritorio_id,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'tipo_reserva' => $tipoReserva,
            'motivo' => $request->motivo,
            'estado' => 'confirmada'
        ]);

        // Obtener información del usuario y del espacio
        $usuario = User::find($request->user_id);
        $espacio = Espacio::find($request->espacio_id);

        // Construir el mensaje de éxito como un array
        $mensajeExito = [];
        $mensajeExito[] = "Reserva creada exitosamente!";
        $mensajeExito[] = "Usuario: {$usuario->name}";
        $mensajeExito[] = "Email: {$usuario->email}";
        $mensajeExito[] = "Espacio: {$espacio->nombre}";

        if ($reserva->escritorio_id) {
            $escritorio = Escritorio::find($reserva->escritorio_id);
            $mensajeExito[] = "Escritorio: {$escritorio->nombre}";
        }

        $mensajeExito[] = "Fecha de Inicio: {$reserva->fecha_inicio->format('d/m/Y H:i')}";
        $mensajeExito[] = "Fecha de Fin: {$reserva->fecha_fin->format('d/m/Y H:i')}";
        $mensajeExito[] = "Tipo de Reserva: {$reserva->tipo_reserva}";

        if ($reserva->motivo) {
            $mensajeExito[] = "Motivo: {$reserva->motivo}";
        }

        // Unir el array con saltos de línea
        $mensajeFinal = implode("\n", $mensajeExito);

        // Regresar con mensaje de éxito
        return back()->with('success', $mensajeFinal);
    }

    // Método para eliminar una reserva
    public function destroy($id)
    {
        $reserva = Reserva::findOrFail($id);
        $reserva->delete();

        return redirect()->route('admin.reservas.index')->with('success', 'Reserva eliminada exitosamente.');
    }
}
