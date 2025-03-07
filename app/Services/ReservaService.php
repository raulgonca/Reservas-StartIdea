<?php
// filepath: app/Services/ReservaService.php

namespace App\Services;

use App\Models\Bloqueo;
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
     * Obtiene los horarios para medio día desde la configuración centralizada
     * 
     * @return array
     */
    protected function getHorariosMedioDia()
    {
        return config('reservas.horarios.medio_dia', [
            'mañana' => ['inicio' => '08:00', 'fin' => '14:00'],
            'tarde' => ['inicio' => '14:00', 'fin' => '20:00']
        ]);
    }

    /**
     * Obtiene los horarios para día completo desde la configuración centralizada
     * 
     * @return array
     */
    protected function getHorarioDiaCompleto()
    {
        return config('reservas.horarios.dia_completo', [
            'inicio' => '00:00',
            'fin' => '23:59'
        ]);
    }

    /**
     * Obtiene los horarios disponibles desde la configuración centralizada
     * 
     * @return array
     */
    protected function getHorasDisponibles()
    {
        return config('reservas.horarios.horas_disponibles', [
            '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
            '20:00', '21:00', '22:00'
        ]);
    }

    /**
     * Configuración de los diferentes tipos de reserva
     */
    protected function getTiposReserva()
    {
        return [
            'hora' => ['requiere_hora' => true, 'duracion' => '1 hour'],
            'medio_dia' => ['requiere_hora' => true, 'duracion' => '6 hours'],
            'dia_completo' => ['requiere_hora' => false, 'duracion' => '1 day'],
            'semana' => ['requiere_hora' => false, 'duracion' => '1 week'],
            'mes' => ['requiere_hora' => false, 'duracion' => '1 month']
        ];
    }

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
        'hora_inicio.in' => 'La hora de inicio seleccionada no está permitida para este tipo de reserva.',
        'hora_fin.required_if' => 'La hora final es requerida para reservas por hora.',
        'hora_fin.date_format' => 'El formato de la hora final debe ser HH:mm.',
        'hora_fin.after' => 'La hora final debe ser posterior a la hora de inicio.',
        'estado.required' => 'El estado de la reserva es requerido.',
        'estado.in' => 'El estado seleccionado no es válido.',
        'motivo.max' => 'El motivo no puede exceder los 255 caracteres.',
    ];


    /**
     * Valida y prepara los datos de la reserva según el tipo de operación
     * 
     * @param array $data Datos de la reserva a validar
     * @param bool $isUpdate Indica si es una actualización
     * @return array Datos validados
     * @throws ValidationException Si la validación falla
     */
    public function validateAndPrepareData($data, $isUpdate = false)
    {
        // Validación específica para actualización de estado
        if ($this->isOnlyStatusData($data)) {
            $validator = Validator::make($data, [
                'estado' => 'required|in:pendiente,confirmada,cancelada',
                'motivo' => 'nullable|string|max:255'
            ], $this->messages);

            if ($validator->fails()) {
                Log::warning('Error de validación en actualización de estado:', [
                    'data' => $data,
                    'errors' => $validator->errors()->toArray()
                ]);
                throw ValidationException::withMessages($validator->errors()->toArray());
            }

            // Si se está confirmando la reserva, verificar solapamientos
            if ($data['estado'] === 'confirmada') {
                // Obtener la reserva existente para verificar solapamientos
                $reserva = Reserva::findOrFail($data['id']);
                $checkData = [
                    'espacio_id' => $reserva->espacio_id,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'fecha_fin' => $reserva->fecha_fin,
                    'tipo_reserva' => $reserva->tipo_reserva,
                    'estado' => $data['estado']
                ];

                $this->checkOverlap($checkData, $reserva->id);
            }

            return $validator->validated();
        }

        // Para tipos de reserva que no requieren horas específicas
        if (isset($data['tipo_reserva']) && in_array($data['tipo_reserva'], ['semana', 'mes', 'dia_completo'])) {
            unset($data['hora_inicio']);
            unset($data['hora_fin']);
        }

        // Validación para creación o actualización completa de reserva
        $esCancelada = isset($data['estado']) && $data['estado'] === 'cancelada';

        // Definición de reglas de validación básicas
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

        // Obtenemos los valores para medio día de la configuración
        $horariosMedioDia = $this->getHorariosMedioDia();
        $horasInicioMedioDia = [
            $horariosMedioDia['mañana']['inicio'],
            $horariosMedioDia['tarde']['inicio']
        ];

        // Reglas para hora_inicio según tipo de reserva
        $rules['hora_inicio'] = [
            Rule::requiredIf(function () use ($data) {
                return in_array($data['tipo_reserva'] ?? '', ['hora', 'medio_dia']);
            }),
            'nullable',
            'date_format:H:i',
            Rule::when(
                isset($data['tipo_reserva']) && $data['tipo_reserva'] === 'medio_dia',
                ['in:' . implode(',', $horasInicioMedioDia)]
            )
        ];

        // Reglas para hora_fin según tipo de reserva
        $rules['hora_fin'] = [
            Rule::requiredIf(function () use ($data) {
                return ($data['tipo_reserva'] ?? '') === 'hora';
            }),
            'nullable',
            'date_format:H:i',
            function ($attribute, $value, $fail) use ($data) {
                if (
                    isset($data['tipo_reserva']) && $data['tipo_reserva'] === 'hora' &&
                    isset($data['hora_inicio']) && $value <= $data['hora_inicio']
                ) {
                    $fail('La hora final debe ser posterior a la hora de inicio');
                }
            }
        ];

        // Validación de todas las reglas definidas
        $validator = Validator::make($data, $rules, $this->messages);

        if ($validator->fails()) {
            Log::warning('Error de validación en actualización completa:', [
                'data' => $data,
                'errors' => $validator->errors()->toArray()
            ]);
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // Procesar y retornar los datos validados
        return $this->calculateDates($validator->validated());
    }

    /**
     * Calcula las fechas de inicio y fin según el tipo de reserva
     * 
     * @param array $data Datos validados de la reserva
     * @return array Datos con fechas calculadas
     * @throws ValidationException Si hay error en las fechas
     */
    protected function calculateDates($data)
    {
        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $tipoReserva = $this->getTiposReserva()[$data['tipo_reserva']];

        if (isset($data['hora_inicio']) && $tipoReserva['requiere_hora']) {
            $fechaInicio->setTimeFromTimeString($data['hora_inicio']);
        } else {
            $fechaInicio->startOfDay();
        }

        switch ($data['tipo_reserva']) {
            case 'hora':
                $fechaFin = isset($data['hora_fin']) ?
                    $fechaInicio->copy()->setTimeFromTimeString($data['hora_fin']) :
                    $fechaInicio->copy()->addHour();
                break;
                
            case 'medio_dia':
                // Usar configuración centralizada para medio día
                $horariosMedioDia = $this->getHorariosMedioDia();
                
                if ($data['hora_inicio'] === $horariosMedioDia['mañana']['inicio']) {
                    $fechaFin = $fechaInicio->copy()->setTimeFromTimeString($horariosMedioDia['mañana']['fin']);
                } elseif ($data['hora_inicio'] === $horariosMedioDia['tarde']['inicio']) {
                    $fechaFin = $fechaInicio->copy()->setTimeFromTimeString($horariosMedioDia['tarde']['fin']);
                } else {
                    throw ValidationException::withMessages([
                        'hora_inicio' => 'Las reservas de medio día solo pueden ser de ' . 
                            $horariosMedioDia['mañana']['inicio'] . ' a ' . $horariosMedioDia['mañana']['fin'] . 
                            ' o de ' . $horariosMedioDia['tarde']['inicio'] . ' a ' . $horariosMedioDia['tarde']['fin']
                    ]);
                }
                break;
                
            case 'dia_completo':
                // Usar configuración centralizada para día completo
                $horarioDiaCompleto = $this->getHorarioDiaCompleto();
                
                // Establecer inicio del día según configuración
                $fechaInicio->setTimeFromTimeString($horarioDiaCompleto['inicio']);
                
                // Establecer fin del día según configuración
                $fechaFin = $fechaInicio->copy()->setTimeFromTimeString($horarioDiaCompleto['fin']);
                break;
                
            case 'semana':
                // Usar configuración centralizada para día completo
                $horarioDiaCompleto = $this->getHorarioDiaCompleto();
                
                // Establecer inicio y fin con horarios de día completo
                $fechaInicio->setTimeFromTimeString($horarioDiaCompleto['inicio']);
                $fechaFin = $fechaInicio->copy()->addWeek()->subSecond();
                break;
                
            case 'mes':
                // Usar configuración centralizada para día completo
                $horarioDiaCompleto = $this->getHorarioDiaCompleto();
                
                // Establecer inicio con horario de día completo
                $fechaInicio->setTimeFromTimeString($horarioDiaCompleto['inicio']);
                
                // Establecer fin del mes con horario de día completo
                $fechaFin = $fechaInicio->copy()->endOfMonth()->setTimeFromTimeString($horarioDiaCompleto['fin']);
                break;
                
            default:
                throw ValidationException::withMessages([
                    'tipo_reserva' => 'Tipo de reserva no válido'
                ]);
        }

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
     * 
     * @param array $data Datos de la reserva
     * @param int|null $reservaId ID de la reserva (en caso de actualización)
     * @throws ValidationException Si hay solapamientos
     */
    public function checkOverlap($data, $reservaId = null)
    {
        if ($this->isOnlyStatusData($data)) {
            return;
        }

        $fechaInicio = Carbon::parse($data['fecha_inicio']);
        $fechaFin = Carbon::parse($data['fecha_fin']);
        $esCancelada = isset($data['estado']) && $data['estado'] === 'cancelada';

        if ($esCancelada) {
            if ($fechaFin->lt($fechaInicio)) {
                throw ValidationException::withMessages([
                    'fecha_fin' => 'La fecha de fin debe ser posterior a la fecha de inicio'
                ]);
            }
            return;
        }

        $espacio = Espacio::findOrFail($data['espacio_id']);

        // Para medio día, verificar que sea uno de los horarios permitidos según la configuración
        if ($data['tipo_reserva'] === 'medio_dia') {
            $horaInicio = $fechaInicio->format('H:i');
            $horaFin = $fechaFin->format('H:i');
            
            $horariosMedioDia = $this->getHorariosMedioDia();
            $horarioValido = false;
            
            foreach ($horariosMedioDia as $periodo => $horario) {
                if ($horaInicio === $horario['inicio'] && $horaFin === $horario['fin']) {
                    $horarioValido = true;
                    break;
                }
            }
            
            if (!$horarioValido) {
                $mensajeError = 'Las reservas de medio día solo pueden ser:';
                foreach ($horariosMedioDia as $periodo => $horario) {
                    $mensajeError .= ' de ' . $horario['inicio'] . ' a ' . $horario['fin'];
                    if ($periodo === 'mañana') {
                        $mensajeError .= ' o';
                    }
                }
                
                throw ValidationException::withMessages([
                    'horario' => $mensajeError
                ]);
            }
        }

        // Verificar reservas simultáneas del mismo usuario
        $this->checkUserSimultaneousReservations($data, $fechaInicio, $fechaFin, $reservaId);

        // Verificar solapamientos con otras reservas
        $this->checkReservationOverlaps($data, $fechaInicio, $fechaFin, $reservaId, $espacio);
        
        // Verificar solapamientos con bloqueos
        $this->checkBlockOverlaps($data, $fechaInicio, $fechaFin);
    }

    /**
     * Verifica reservas simultáneas del mismo usuario
     */
    protected function checkUserSimultaneousReservations($data, $fechaInicio, $fechaFin, $reservaId)
    {
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
    }

    /**
     * Verifica solapamientos con otras reservas
     */
    protected function checkReservationOverlaps($data, $fechaInicio, $fechaFin, $reservaId, $espacio)
    {
        Log::debug('Iniciando verificación de solapamientos', [
            'espacio_id' => $data['espacio_id'],
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'tipo_reserva' => $data['tipo_reserva']
        ]);

        $query = Reserva::where('espacio_id', $data['espacio_id'])
            ->where('estado', 'confirmada')
            ->where('id', '!=', $reservaId);

        if (!empty($data['escritorio_id'])) {
            $query->where('escritorio_id', $data['escritorio_id']);
        }

        // Mejorada la lógica de verificación temporal considerando tipos de reserva
        $query->where(function ($q) use ($fechaInicio, $fechaFin, $data) {
            // Para reservas de día completo, semana o mes
            if (in_array($data['tipo_reserva'], ['dia_completo', 'semana', 'mes'])) {
                $q->where(function ($q1) use ($fechaInicio, $fechaFin) {
                    $q1->whereDate('fecha_inicio', '<=', $fechaFin->format('Y-m-d'))
                       ->whereDate('fecha_fin', '>=', $fechaInicio->format('Y-m-d'));
                });
            } else {
                // Para reservas por hora o medio día, verificar también las horas
                $q->where(function ($q1) use ($fechaInicio, $fechaFin) {
                    $q1->where(function ($q2) use ($fechaInicio, $fechaFin) {
                        // La nueva reserva está dentro de una existente
                        $q2->where('fecha_inicio', '<=', $fechaInicio)
                           ->where('fecha_fin', '>=', $fechaFin);
                    })->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                        // La nueva reserva contiene a una existente
                        $q2->where('fecha_inicio', '>=', $fechaInicio)
                           ->where('fecha_fin', '<=', $fechaFin);
                    })->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                        // Solapamiento parcial
                        $q2->where('fecha_inicio', '<', $fechaFin)
                           ->where('fecha_fin', '>', $fechaInicio);
                    });
                });
            }
        });

        $solapamientos = $query->get();
        
        if ($solapamientos->isNotEmpty()) {
            Log::warning('Se encontraron solapamientos', [
                'cantidad' => $solapamientos->count(),
                'solapamientos' => $solapamientos->map->only(['id', 'fecha_inicio', 'fecha_fin', 'tipo_reserva'])
            ]);
            
            throw ValidationException::withMessages([
                'solapamiento' => $this->formatSolapamientosMessage($solapamientos, $espacio)
            ]);
        }
    }

    protected function formatSolapamientosMessage($solapamientos, $espacio) 
    {
        return "El espacio ya está reservado en los siguientes períodos:\n" . 
            $solapamientos->map(function ($reserva) use ($espacio) {
                $fecha = Carbon::parse($reserva->fecha_inicio)->format('d/m/Y');
                $horario = '';
                
                if (in_array($reserva->tipo_reserva, ['hora', 'medio_dia'])) {
                    $horario = sprintf(" de %s a %s",
                        Carbon::parse($reserva->fecha_inicio)->format('H:i'),
                        Carbon::parse($reserva->fecha_fin)->format('H:i')
                    );
                }
                
                $escritorioInfo = '';
                if ($espacio->tipo === 'coworking' && $reserva->escritorio_id) {
                    $escritorioInfo = " - Escritorio: {$reserva->escritorio->numero}";
                }
                
                return sprintf("• %s%s (%s)%s",
                    $fecha,
                    $horario,
                    ucfirst($reserva->tipo_reserva),
                    $escritorioInfo
                );
            })->join("\n");
    }
    
    /**
     * Verifica solapamientos con bloqueos existentes
     * 
     * @param array $data Datos de la reserva
     * @param Carbon $fechaInicio Fecha de inicio
     * @param Carbon $fechaFin Fecha de fin
     * @throws ValidationException Si hay solapamientos con bloqueos
     */
    protected function checkBlockOverlaps($data, $fechaInicio, $fechaFin)
    {
        $query = Bloqueo::query();
        
        // Verificar solapamientos por espacio
        if (!empty($data['espacio_id'])) {
            $query->where(function($q) use ($data) {
                $q->where('espacio_id', $data['espacio_id'])
                  ->orWhereNull('espacio_id');
            });
        }
        
        // Verificar solapamientos por escritorio
        if (!empty($data['escritorio_id'])) {
            $query->orWhere('escritorio_id', $data['escritorio_id']);
        }
        
        // Verificar solapamiento temporal
        $query->where(function ($q) use ($fechaInicio, $fechaFin) {
            $q->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                    $q->where('fecha_inicio', '<=', $fechaInicio)
                        ->where('fecha_fin', '>=', $fechaFin);
                });
        });
        
        $bloqueos = $query->get();
        
        if ($bloqueos->isNotEmpty()) {
            $mensajes = $bloqueos->map(function ($bloqueo) {
                return sprintf(
                    "• %s: %s - %s (Motivo: %s)",
                    Carbon::parse($bloqueo->fecha_inicio)->format('d/m/Y'),
                    Carbon::parse($bloqueo->fecha_inicio)->format('H:i'),
                    Carbon::parse($bloqueo->fecha_fin)->format('H:i'),
                    $bloqueo->motivo
                );
            })->join("\n");
            
            throw ValidationException::withMessages([
                'bloqueo' => "El espacio o escritorio está bloqueado en los siguientes períodos:\n" . $mensajes
            ]);
        }
    }

    /**
     * Verifica si los datos son solo para actualización de estado
     */
    protected function isOnlyStatusData($data)
    {
        if (isset($data['is_status_update']) && $data['is_status_update'] === 'true') {
            // Campos válidos para actualización de estado
            $validFields = ['estado', 'motivo', 'is_status_update', 'id'];

            // Filtrar campos del sistema y obtener campos reales
            $actualFields = array_filter(array_keys($data), function ($key) {
                return !in_array($key, ['_method', '_token', '_id']);
            });

            return empty(array_diff($actualFields, $validFields));
        }
        return false;
    }
}