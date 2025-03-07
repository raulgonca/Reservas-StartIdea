<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuración de notificaciones de reservas
    |--------------------------------------------------------------------------
    |
    | Define la configuración específica para el sistema de reservas,
    | incluyendo el correo para notificaciones y otras opciones relacionadas.
    |
    */

    'notification_email' => env('RESERVAS_NOTIFICATION_EMAIL', 'admin@tudominio.com'),

    'mail' => [
        'debug' => env('MAIL_DEBUG', false),
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'no-reply@reservas.com'),
            'name' => env('MAIL_FROM_NAME', 'Sistema de Reservas'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Estados de reserva
    |--------------------------------------------------------------------------
    |
    | Define los estados posibles para una reserva en el sistema.
    |
    */

    'estados' => [
        'pendiente' => 'pendiente',
        'confirmada' => 'confirmada',
        'cancelada' => 'cancelada',
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de horarios
    |--------------------------------------------------------------------------
    |
    | Define los horarios disponibles para reservas y bloqueos.
    | Estos valores se utilizan para validar y restringir los horarios
    | que se pueden seleccionar en el sistema.
    |
    */

    'horarios' => [
        // Horario operativo (horas disponibles para reservas)
        'hora_inicio' => '08:00',
        'hora_fin' => '22:00',
        
        // Intervalo entre slots en minutos (60 = slots de una hora)
        'intervalo_minutos' => 60,
        
        // Configuración para medio día
        'medio_dia' => [
            'mañana' => ['inicio' => '08:00', 'fin' => '14:00', 'label' => 'Mañana (08:00 - 14:00)'],
            'tarde' => ['inicio' => '14:00', 'fin' => '20:00', 'label' => 'Tarde (14:00 - 20:00)'],
        ],
        
        // Configuración para día completo, semana y mes
        'dia_completo' => [
            'inicio' => '00:00',
            'fin' => '23:59',
            'label' => 'Día completo (00:00 - 23:59)'
        ],
        
        // Lista de horas disponibles para selección en formularios
        'horas_disponibles' => [
            '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
            '20:00', '21:00', '22:00'
        ],
    ],
];