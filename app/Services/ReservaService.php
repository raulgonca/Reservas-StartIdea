<?php

namespace App\Services;

use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

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

    /**
     * Valida y prepara los datos de la reserva
     */
    public function validateAndPrepareData($data, $isUpdate = false, $originalReserva = null)
    {
        // Verifica si solo se está actualizando estado o motivo
        $isOnlyStatusOrMotivo = $this->isOnlyStatusOrMotivoUpdate($data, $originalReserva);
        
        if (!$isOnlyStatusOrMotivo) {
            $this->validateReservaType($data);
            $data = $this->cleanData($data);
        }
        
        $rules = $this->getBaseRules($isUpdate, $isOnlyStatusOrMotivo);
        $validator = Validator::make($data, $rules, $this->messages);
        
        if (!$isOnlyStatusOrMotivo) {
            $this->addConditionalRules($validator);
        }

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        return $isOnlyStatusOrMotivo ? $data : $this->calculateDates($data);
    }

    /**
     * Verifica si la actualización es solo de estado o motivo
     */
    public function isOnlyStatusOrMotivoUpdate($newData, $originalReserva)
    {
        if (!$originalReserva) {
            return false;
        }

        $unchangedFields = [
            'user_id' => $originalReserva->user_id,
            'espacio_id' => $originalReserva->espacio_id,
            'escritorio_id' => $originalReserva->escritorio_id,
            'fecha_inicio' => $originalReserva->fecha_inicio->format('Y-m-d'),
            'tipo_reserva' => $originalReserva->tipo_reserva,
            'hora_inicio' => $originalReserva->hora_inicio,
            'hora_fin' => $originalReserva->hora_fin,
        ];

        foreach ($unchangedFields as $field => $value) {
            if (isset($newData[$field]) && $newData[$field] != $value) {
                return false;
            }
        }

        return true;
    }

    /**
     * Valida el tipo de reserva
     */
    protected function validateReservaType($data)
    {
        if (!isset(self::TIPOS_RESERVA[$data['tipo_reserva'] ?? ''])) {
            throw ValidationException::withMessages([
                'tipo_reserva' => 'Tipo de reserva inválido.'
            ]);
        }
    }

    /**
     * Limpia los datos según el tipo de reserva
     */
    protected function cleanData($data)
    {
        $tipoReserva = self::TIPOS_RESERVA[$data['tipo_reserva']];
        
        if (!$tipoReserva['requiere_hora']) {
            $data['hora_inicio'] = null;
            $data['hora_fin'] = null;
        }

        return $data;
    }

    /**
     * Obtiene las reglas de validación base
     */
    protected function getBaseRules($isUpdate, $isOnlyStatusOrMotivo)
    {
        if ($isOnlyStatusOrMotivo) {
            return [
                'estado' => 'required|in:pendiente,confirmada,cancelada',
                'motivo' => 'nullable|string|max:255',
            ];
        }

        return [
            'user_id' => 'required|exists:users,id',
            'espacio_id' => 'required|exists:espacios,id',
            'escritorio_id' => 'nullable|exists:escritorios,id',
            'tipo_reserva' => 'required|in:' . implode(',', array_keys(self::TIPOS_RESERVA)),
            'estado' => 'required|in:pendiente,confirmada,cancelada',
            'motivo' => 'nullable|string|max:255',
            'fecha_inicio' => $isUpdate ? 'required|date' : 'required|date|after_or_equal:today',
        ];
    }

    /**
     * Agrega reglas condicionales al validador
     */
    protected function addConditionalRules($validator)
    {
        $validator->sometimes(['hora_inicio', 'hora_fin'], 'required|date_format:H:i', function ($input) {
            return self::TIPOS_RESERVA[$input->tipo_reserva]['requiere_hora'];
        });

        $validator->sometimes('hora_inicio', 'in:08:00,14:00', function ($input) {
            return $input->tipo_reserva === 'medio_dia';
        });

        $validator->sometimes('hora_fin', 'after:hora_inicio', function ($input) {
            return $input->tipo_reserva === 'hora';
        });
    }

    /**
     * Calcula las fechas de inicio y fin según el tipo de reserva
     */
    protected function calculateDates($data)
{
    $fechaInicio = Carbon::parse($data['fecha_inicio']);
    $tipoReserva = self::TIPOS_RESERVA[$data['tipo_reserva']];

    // Manejar la hora de inicio si está presente
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
    }

    // Solo devolver los campos que existen en la tabla
    return [
        'user_id' => $data['user_id'],
        'espacio_id' => $data['espacio_id'],
        'escritorio_id' => $data['escritorio_id'],
        'fecha_inicio' => $fechaInicio,
        'fecha_fin' => $fechaFin,
        'tipo_reserva' => $data['tipo_reserva'],
        'estado' => $data['estado'],
        'motivo' => $data['motivo'] ?? null
    ];
}

    /**
     * Verifica solapamiento con otras reservas
     */
    public function checkOverlap($data, $reservaId = null)
{
    // Agregar logs para debug
    Log::info('Datos recibidos en checkOverlap:', [
        'data_completa' => $data,
        'reserva_id' => $reservaId,
        'is_only_status' => $this->isOnlyStatusData($data)
    ]);

    // No verificar solapamiento si solo se está actualizando estado o motivo
    if ($this->isOnlyStatusData($data)) {
        Log::info('Omitiendo verificación de solapamiento - solo estado/motivo');
        return;
    }

    Log::info('Iniciando verificación de solapamiento', [
        'espacio_id' => $data['espacio_id'],
        'fecha_inicio' => $data['fecha_inicio'],
        'fecha_fin' => $data['fecha_fin'],
        'escritorio_id' => $data['escritorio_id'] ?? null
    ]);

    $query = Reserva::where('espacio_id', $data['espacio_id'])
        ->where('estado', '!=', 'cancelada')
        ->where(function ($query) use ($data) {
            $query->where(function ($q) use ($data) {
                $q->whereBetween('fecha_inicio', [$data['fecha_inicio'], $data['fecha_fin']])
                  ->orWhereBetween('fecha_fin', [$data['fecha_inicio'], $data['fecha_fin']])
                  ->orWhere(function ($q) use ($data) {
                      $q->where('fecha_inicio', '<=', $data['fecha_inicio'])
                        ->where('fecha_fin', '>=', $data['fecha_fin']);
                  });
            });
        });

    if ($data['escritorio_id']) {
        $query->where('escritorio_id', $data['escritorio_id']);
    }

    if ($reservaId) {
        $query->where('id', '!=', $reservaId);
    }

    // Log de la consulta SQL
    Log::info('Query de solapamiento:', [
        'sql' => $query->toSql(),
        'bindings' => $query->getBindings()
    ]);

    $solapamientos = $query->get();

    Log::info('Resultado de búsqueda de solapamientos:', [
        'cantidad_solapamientos' => $solapamientos->count(),
        'solapamientos' => $solapamientos->map(function ($r) {
            return [
                'id' => $r->id,
                'fecha_inicio' => $r->fecha_inicio,
                'fecha_fin' => $r->fecha_fin,
                'tipo_reserva' => $r->tipo_reserva
            ];
        })
    ]);

    if ($solapamientos->isNotEmpty()) {
        $mensajes = $solapamientos->map(function ($reserva) {
            return sprintf(
                "• %s - %s (%s)",
                Carbon::parse($reserva->fecha_inicio)->format('d/m/Y H:i'),
                Carbon::parse($reserva->fecha_fin)->format('d/m/Y H:i'),
                $reserva->tipo_reserva
            );
        })->join("\n");

        Log::warning('Solapamiento detectado', [
            'mensajes' => $mensajes
        ]);

        throw ValidationException::withMessages([
            'solapamiento' => "El espacio ya está reservado en los siguientes períodos:\n" . $mensajes
        ]);
    }

    Log::info('Verificación de solapamiento completada sin conflictos');
}









    /**
     * Verifica si los datos son solo de estado
     */
    public function isOnlyStatusData($data)
    {
        // Campos permitidos para actualización de estado
        $allowedFields = ['estado', 'motivo', '_method', '_token', 'is_status_update'];
        
        // Filtrar campos reales (no del sistema) y no vacíos
        $receivedFields = array_filter(array_keys($data), function($key) use ($data) {
            $isSystemField = in_array($key, ['_method', '_token']);
            $isEmpty = !isset($data[$key]) || $data[$key] === '' || $data[$key] === null;
            
            return !$isSystemField && !$isEmpty;
        });
    
        Log::info('Verificación de campos:', [
            'campos_permitidos' => $allowedFields,
            'campos_recibidos' => $receivedFields,
            'diferencia' => array_diff($receivedFields, $allowedFields)
        ]);
    
        // Si tiene is_status_update, verificar que solo tenga estado y motivo
        if (isset($data['is_status_update']) && $data['is_status_update'] === 'true') {
            $validFields = ['estado', 'motivo'];
            $actualFields = array_diff($receivedFields, ['is_status_update']);
            return empty(array_diff($actualFields, $validFields));
        }
    
        return false;
    }









}