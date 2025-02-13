<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Espacio;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

/**
 * Servicio para la gestión de reservas
 * Maneja la validación, creación y verificación de solapamientos de reservas
 */
class ReservaService
{
    /**
     * Horarios predefinidos para reservas de medio día (podemos modificarlos aqui...)
     */
    protected const HORARIOS_MEDIO_DIA = [
        'mañana' => ['inicio' => '08:00', 'fin' => '14:00'],
        'tarde' => ['inicio' => '14:00', 'fin' => '20:00']
    ];

    /**
     * Configuración de los diferentes tipos de reserva
     * Especifica si requieren hora específica y su duración
     */
    protected const TIPOS_RESERVA = [
        'hora' => ['requiere_hora' => true, 'duracion' => '1 hour'],
        'medio_dia' => ['requiere_hora' => true, 'duracion' => '6 hours'],  //  para modificar el rango de horario en medio dia aqui...
        'dia_completo' => ['requiere_hora' => false, 'duracion' => '1 day'],
        'semana' => ['requiere_hora' => false, 'duracion' => '1 week'],
        'mes' => ['requiere_hora' => false, 'duracion' => '1 month']
    ];

    /**
     * Mensajes personalizados para las validaciones
     */
    protected $messages = [
        'user_id.required' => 'El usuario es requerido.',
        'user_id.exists' => 'El usuario seleccionado no existe.',
        'espacio_id.required' => 'El espacio es requerido.',
        'espacio_id.exists' => 'El espacio seleccionado no existe.',
        'escritorio_id.exists' => 'El escritorio seleccionado no existe.',
        'tipo_reserva.required' => 'El tipo de reserva es requerido.',
        'tipo_reserva.in' => 'El tipo de reserva seleccionado no es válido.',
        'fecha_inicio.required' => 'La fecha de inicio es requerida.',
        'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',
        'fecha_inicio.after_or_equal' => 'La fecha de inicio no puede ser anterior al día actual.',
        'hora_inicio.required_if' => 'La hora de inicio es requerida para reservas por hora o medio día.',
        'hora_inicio.date_format' => 'El formato de la hora de inicio debe ser HH:mm.',
        'hora_inicio.in' => 'Para medio día solo se permiten los horarios: 08:00 (mañana) o 14:00 (tarde).',
        'hora_fin.required_if' => 'La hora final es requerida para reservas por hora.',
        'hora_fin.date_format' => 'El formato de la hora final debe ser HH:mm.',
        'hora_fin.after' => 'La hora final debe ser posterior a la hora de inicio.',
        'estado.required' => 'El estado de la reserva es requerido.',
        'estado.in' => 'El estado seleccionado no es válido.',
        'motivo.max' => 'El motivo no puede exceder los 255 caracteres.',
    ];

    /**
     * Valida y prepara los datos de la reserva
     * @param array $data Datos de la reserva
     * @param bool $isUpdate Indica si es una actualización
     * @return array Datos validados y procesados
     * @throws ValidationException
     */
    public function validateAndPrepareData($data, $isUpdate = false)
    {
        // Validar fecha en el pasado antes de otras validaciones
        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $esCancelada = isset($data['estado']) && $data['estado'] === 'cancelada';

        // Para reservas no canceladas y nuevas, verificar que no sean en el pasado
        if (!$esCancelada && !$isUpdate) {
            $ahora = Carbon::now()->startOfDay();
            if ($fechaInicio->lt($ahora)) {
                throw ValidationException::withMessages([
                    'fecha_inicio' => 'No se pueden hacer reservas en fechas pasadas'
                ]);
            }
        }

        // Reglas de validación básicas
        $rules = [
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha_inicio' => [
                'required',
                'date',
                function ($attribute, $value, $fail) use ($esCancelada, $isUpdate) {
                    if (!$esCancelada && !$isUpdate) {
                        $fechaInicio = Carbon::parse($value);
                        $ahora = Carbon::now()->startOfDay();
                        if ($fechaInicio->lt($ahora)) {
                            $fail('No se pueden hacer reservas en fechas pasadas');
                        }
                    }
                }
            ],
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
            'estado' => 'required|in:pendiente,confirmada,cancelada',
            'motivo' => 'nullable|string|max:255'
        ];

        // Reglas adicionales para reservas por hora o medio día (podemos modificarlos aqui...)
        $rules['hora_inicio'] = [
            Rule::requiredIf(function () use ($data) {
                return in_array($data['tipo_reserva'] ?? '', ['hora', 'medio_dia']);
            }),
            'nullable',
            'date_format:H:i',
            Rule::when(
                isset($data['tipo_reserva']) && $data['tipo_reserva'] === 'medio_dia',
                ['in:08:00,14:00']
            )
        ];

        $rules['hora_fin'] = [
            Rule::requiredIf(function () use ($data) {
                return in_array($data['tipo_reserva'] ?? '', ['hora', 'medio_dia']);
            }),
            'nullable',
            'date_format:H:i',
            'after:hora_inicio'
        ];

        // Validar los datos
        $validator = Validator::make($data, $rules, $this->messages);

        if ($validator->fails()) {
            Log::warning('Error de validación:', [
                'data' => $data,
                'errors' => $validator->errors()->toArray()
            ]);
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // Calcular las fechas según el tipo de reserva
        $datosValidados = $validator->validated();
        return $this->calculateDates($datosValidados);
    }

    /**
     * Calcula las fechas de inicio y fin según el tipo de reserva
     * @param array $data Datos validados
     * @return array Datos con fechas calculadas
     * @throws ValidationException
     */
    protected function calculateDates($data)
    {
        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $tipoReserva = self::TIPOS_RESERVA[$data['tipo_reserva']];

        // Establecer la hora si es necesario
        if (isset($data['hora_inicio']) && $tipoReserva['requiere_hora']) {
            $fechaInicio->setTimeFromTimeString($data['hora_inicio']);
        } else {
            $fechaInicio->startOfDay();
        }

        // Calcular fecha fin según tipo de reserva
        switch ($data['tipo_reserva']) {
            case 'hora':
                $fechaFin = $fechaInicio->copy()->addHour();
                break;
            case 'medio_dia':
                $fechaFin = $fechaInicio->copy()->addHours(6);
                break;
            case 'dia_completo':
                $fechaFin = $fechaInicio->copy()->endOfDay();
                break;
            case 'semana':
                $fechaFin = $fechaInicio->copy()->addWeek()->subSecond();
                break;
            case 'mes':
                $fechaFin = $fechaInicio->copy()->endOfMonth();
                break;
            default:
                throw ValidationException::withMessages([
                    'tipo_reserva' => 'Tipo de reserva no válido'
                ]);
        }

        // Verificar que la fecha fin no sea anterior a la fecha inicio
        if ($fechaFin->lt($fechaInicio)) {
            throw ValidationException::withMessages([
                'fecha_fin' => 'La fecha de fin debe ser posterior a la fecha de inicio'
            ]);
        }

        return [
            'user_id' => $data['user_id'],
            'espacio_id' => $data['espacio_id'],
            'escritorio_id' => $data['escritorio_id'] ?? null,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'tipo_reserva' => $data['tipo_reserva'],
            'estado' => $data['estado'],
            'motivo' => $data['motivo'] ?? null
        ];
    }




    /**
     * Verifica si hay solapamientos con otras reservas
     * @param array $data Datos de la reserva
     * @param int|null $reservaId ID de la reserva actual (para actualizaciones)
     * @throws ValidationException
     */
    public function checkOverlap($data, $reservaId = null)
    {
        // Si solo es actualización de estado, no verificar solapamientos
        if ($this->isOnlyStatusData($data)) {
            return;
        }

        // Convertir fechas a objetos Carbon
        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $fechaFin = Carbon::parse($data['fecha_fin']);

        // Comprobar si es una reserva cancelada
        $esCancelada = isset($data['estado']) && $data['estado'] === 'cancelada';

        // Para reservas canceladas, solo validar fechas invertidas
        if ($esCancelada) {
            if ($fechaFin->lt($fechaInicio)) {
                throw ValidationException::withMessages([
                    'fecha_fin' => 'La fecha de fin debe ser posterior a la fecha de inicio'
                ]);
            }
            return;
        }

        // 1. Verificar fechas invertidas (para reservas no canceladas)
        if ($fechaFin->lt($fechaInicio)) {
            throw ValidationException::withMessages([
                'fecha_fin' => 'La fecha de fin debe ser posterior a la fecha de inicio'
            ]);
        }

        // 2. Obtener el espacio
        $espacio = Espacio::findOrFail($data['espacio_id']);

        // 3. Verificar horario del espacio
        if (!$espacio->disponible_24_7 && in_array($data['tipo_reserva'], ['hora', 'medio_dia'])) {
            $horaInicio = $fechaInicio->format('H:i:s');
            $horaFin = $fechaFin->format('H:i:s');

            if ($horaInicio < $espacio->horario_inicio || $horaFin > $espacio->horario_fin) {
                throw ValidationException::withMessages([
                    'horario' => "Las reservas deben estar dentro del horario del espacio ({$espacio->horario_inicio} - {$espacio->horario_fin})"
                ]);
            }
        }

        // 4. Verificar reservas simultáneas del mismo usuario
        $reservasSimultaneas = Reserva::where('user_id', $data['user_id'])
            ->where('estado', 'confirmada')
            ->where('id', '!=', $reservaId)
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                    ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                    ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                        $q->where('fecha_inicio', '<=', $fechaInicio)
                            ->where('fecha_fin', '>=', $fechaFin);
                    });
            })->exists();

        if ($reservasSimultaneas) {
            throw ValidationException::withMessages([
                'usuario' => 'Ya tienes una reserva activa en este horario'
            ]);
        }

        // 5. Verificar solapamientos con otras reservas
        $query = Reserva::where('espacio_id', $data['espacio_id'])
            ->where('estado', 'confirmada')
            ->where('id', '!=', $reservaId);

        // Añadir filtro de escritorio si está especificado
        if (!empty($data['escritorio_id'])) {
            $query->where('escritorio_id', $data['escritorio_id']);
        }

        // Verificar solapamientos de fechas
        $query->where(function ($q) use ($fechaInicio, $fechaFin) {
            $q->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                    $q->where('fecha_inicio', '<=', $fechaInicio)
                        ->where('fecha_fin', '>=', $fechaFin);
                });
        });

        $solapamientos = $query->get();

        if ($solapamientos->isNotEmpty()) {
            $mensajes = $solapamientos->map(function ($reserva) use ($espacio) {
                return sprintf(
                    "• %s: %s - %s (%s)%s",
                    Carbon::parse($reserva->fecha_inicio)->format('d/m/Y'),
                    Carbon::parse($reserva->fecha_inicio)->format('H:i'),
                    Carbon::parse($reserva->fecha_fin)->format('H:i'),
                    ucfirst($reserva->tipo_reserva),
                    ($espacio->tipo === 'coworking' && $reserva->escritorio_id) ? " - Escritorio: {$reserva->escritorio->nombre}" : ""
                );
            })->join("\n");

            throw ValidationException::withMessages([
                'solapamiento' => "El espacio ya está reservado en los siguientes períodos:\n" . $mensajes
            ]);
        }
    }


    /**
     * Verifica si los datos son solo para actualización de estado
     * @param array $data Datos de la reserva
     * @return bool
     */
    public function isOnlyStatusData($data)
    {
        $allowedFields = ['estado', 'motivo', '_method', '_token', 'is_status_update'];

        $receivedFields = array_filter(array_keys($data), function ($key) use ($data) {
            return !in_array($key, ['_method', '_token']) &&
                isset($data[$key]) &&
                $data[$key] !== '' &&
                $data[$key] !== null;
        });

        if (isset($data['is_status_update']) && $data['is_status_update'] === 'true') {
            $validFields = ['estado', 'motivo'];
            $actualFields = array_diff($receivedFields, ['is_status_update']);
            return empty(array_diff($actualFields, $validFields));
        }

        return false;
    }
}
