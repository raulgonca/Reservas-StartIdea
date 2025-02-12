<?php

namespace App\Services;

use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ReservaService
{
    // Definición de horarios disponibles para medio día
    protected const HORARIOS_MEDIO_DIA = [
        'mañana' => ['inicio' => '08:00', 'fin' => '14:00'],
        'tarde' => ['inicio' => '14:00', 'fin' => '20:00']
    ];

    // Configuración de tipos de reserva y sus características
    protected const TIPOS_RESERVA = [
        'hora' => ['requiere_hora' => true, 'duracion' => '1 hour'],
        'medio_dia' => ['requiere_hora' => true, 'duracion' => '6 hours'],
        'dia_completo' => ['requiere_hora' => false, 'duracion' => '1 day'],
        'semana' => ['requiere_hora' => false, 'duracion' => '1 week'],
        'mes' => ['requiere_hora' => false, 'duracion' => '1 month']
    ];

    // Mensajes de validación personalizados
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

    public function validateAndPrepareData($data, $isUpdate = false)
    {
        $validator = Validator::make($data, [
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'tipo_reserva' => 'required|in:hora,medio_dia,dia_completo,semana,mes',
            'estado' => 'required|in:pendiente,confirmada,cancelada',
            'motivo' => 'nullable|string|max:255',
            'hora_inicio' => [
                Rule::requiredIf(function () use ($data) {
                    return in_array($data['tipo_reserva'] ?? '', ['hora', 'medio_dia']);
                }),
                'nullable',
                'date_format:H:i',
                Rule::when(isset($data['tipo_reserva']) && $data['tipo_reserva'] === 'medio_dia', 
                    ['in:08:00,14:00'])
            ],
            'hora_fin' => [
                Rule::requiredIf(function () use ($data) {
                    return in_array($data['tipo_reserva'] ?? '', ['hora', 'medio_dia']);
                }),
                'nullable',
                'date_format:H:i',
                'after:hora_inicio'
            ]
        ], $this->messages);

        if ($validator->fails()) {
            Log::warning('Error de validación:', [
                'data' => $data,
                'errors' => $validator->errors()->toArray()
            ]);
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        return $this->calculateDates($validator->validated());
    }

    protected function calculateDates($data)
    {
        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $tipoReserva = self::TIPOS_RESERVA[$data['tipo_reserva']];

        if (isset($data['hora_inicio']) && $tipoReserva['requiere_hora']) {
            $fechaInicio->setTimeFromTimeString($data['hora_inicio']);
        } else {
            $fechaInicio->startOfDay();
        }

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

    public function checkOverlap($data, $reservaId = null)
    {
        if ($this->isOnlyStatusData($data)) {
            return;
        }

        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $fechaFin = Carbon::parse($data['fecha_fin']);

        Log::info('Verificando solapamiento para:', [
            'espacio_id' => $data['espacio_id'],
            'escritorio_id' => $data['escritorio_id'] ?? null,
            'fecha_inicio' => $fechaInicio->format('Y-m-d H:i:s'),
            'fecha_fin' => $fechaFin->format('Y-m-d H:i:s'),
        ]);

        $query = Reserva::where('espacio_id', $data['espacio_id'])
            ->where('estado', '!=', 'cancelada')
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->where(function ($q) use ($fechaInicio, $fechaFin) {
                    $q->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                      ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                      ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                          $q->where('fecha_inicio', '<=', $fechaInicio)
                            ->where('fecha_fin', '>=', $fechaFin);
                      });
                });
            });

        if (!empty($data['escritorio_id'])) {
            $query->where('escritorio_id', $data['escritorio_id']);
        }

        if ($reservaId) {
            $query->where('id', '!=', $reservaId);
        }

        $solapamientos = $query->get();

        if ($solapamientos->isNotEmpty()) {
            $mensajes = $solapamientos->map(function ($reserva) {
                $horario = Carbon::parse($reserva->fecha_inicio)->format('H:i') . ' - ' . 
                          Carbon::parse($reserva->fecha_fin)->format('H:i');
                
                return sprintf(
                    "• %s: %s - %s (%s) %s",
                    Carbon::parse($reserva->fecha_inicio)->format('d/m/Y'),
                    Carbon::parse($reserva->fecha_inicio)->format('H:i'),
                    Carbon::parse($reserva->fecha_fin)->format('H:i'),
                    ucfirst($reserva->tipo_reserva),
                    $reserva->escritorio_id ? "- Escritorio: {$reserva->escritorio->nombre}" : ""
                );
            })->join("\n");

            Log::warning('Solapamiento detectado', [
                'reserva_id' => $reservaId,
                'nueva_reserva' => $data,
                'solapamientos' => $solapamientos->toArray()
            ]);

            throw ValidationException::withMessages([
                'solapamiento' => "El espacio ya está reservado en los siguientes períodos:\n" . $mensajes
            ]);
        }
    }

    public function isOnlyStatusData($data)
    {
        $allowedFields = ['estado', 'motivo', '_method', '_token', 'is_status_update'];
        
        $receivedFields = array_filter(array_keys($data), function($key) use ($data) {
            return !in_array($key, ['_method', '_token']) && 
                   isset($data[$key]) && 
                   $data[$key] !== '' && 
                   $data[$key] !== null;
        });
    
        Log::info('Verificación de campos:', [
            'campos_permitidos' => $allowedFields,
            'campos_recibidos' => $receivedFields,
            'diferencia' => array_diff($receivedFields, $allowedFields)
        ]);
    
        if (isset($data['is_status_update']) && $data['is_status_update'] === 'true') {
            $validFields = ['estado', 'motivo'];
            $actualFields = array_diff($receivedFields, ['is_status_update']);
            return empty(array_diff($actualFields, $validFields));
        }
    
        return false;
    }
}