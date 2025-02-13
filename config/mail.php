<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mailer por Defecto
    |--------------------------------------------------------------------------
    |
    | Esta opción controla el mailer predeterminado que se usa para enviar todos
    | los mensajes de correo electrónico a menos que se especifique explícitamente
    | otro mailer al enviar el mensaje. Todos los mailers adicionales pueden
    | configurarse dentro del array "mailers".
    |
    */

    'default' => env('MAIL_MAILER', 'smtp'),

    /*
    |--------------------------------------------------------------------------
    | Configuraciones de Mailer
    |--------------------------------------------------------------------------
    |
    | Aquí puede configurar todos los mailers utilizados por su aplicación más
    | su configuración respectiva. Se han configurado varios ejemplos para
    | usted y puede agregar los suyos propios según lo requiera su aplicación.
    |
    | Laravel admite una variedad de controladores de correo "transport" que se 
    | pueden usar al entregar un correo electrónico. Puede especificar cuál está
    | usando para sus mailers a continuación.
    |
    | Soportados: "smtp", "sendmail", "mailgun", "ses", "ses-v2",
    |            "postmark", "resend", "log", "array",
    |            "failover", "roundrobin"
    |
    */

    'mailers' => [
        'smtp' => [
        'transport' => 'smtp',
        'host' => env('MAIL_HOST', 'sandbox.smtp.mailtrap.io'),
        'port' => env('MAIL_PORT', 2525),
        'encryption' => env('MAIL_ENCRYPTION', 'tls'),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'timeout' => 5,
        'auth_mode' => null,
        'verify_peer' => false,
    ],

        'ses' => [
            'transport' => 'ses',
        ],

        'postmark' => [
            'transport' => 'postmark',
        ],

        'resend' => [
            'transport' => 'resend',
        ],

        'sendmail' => [
            'transport' => 'sendmail',
            'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
        ],

        'log' => [
            'transport' => 'log',
            'channel' => env('MAIL_LOG_CHANNEL'),
        ],

        'array' => [
            'transport' => 'array',
        ],

        'failover' => [
            'transport' => 'failover',
            'mailers' => [
                'smtp',
                'log',
            ],
        ],

        'roundrobin' => [
            'transport' => 'roundrobin',
            'mailers' => [
                'ses',
                'postmark',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Dirección Global "From"
    |--------------------------------------------------------------------------
    |
    | Es posible que desee que todos los correos electrónicos enviados por su
    | aplicación se envíen desde la misma dirección. Aquí puede especificar
    | un nombre y una dirección que se usa globalmente para todos los correos
    | electrónicos que envía su aplicación.
    |
    */

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'no-reply@reservas.com'),
        'name' => env('MAIL_FROM_NAME', 'Sistema de Reservas'),
    ],

];