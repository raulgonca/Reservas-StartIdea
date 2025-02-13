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
];