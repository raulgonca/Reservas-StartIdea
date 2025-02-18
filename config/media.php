<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Media Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración básica para el manejo de medios en la aplicación.
    |
    */

    // Rutas base para diferentes tipos de medios
    'paths' => [
        'espacios' => [
            'base' => 'images/espacios',    // Mantiene la estructura actual de imágenes
            'videos' => 'videos/espacios',   // Ajustado a la estructura actual de videos
        ],
    ],

    // Disco de almacenamiento predeterminado
    'storage_disk' => 'public',

    // Extensiones permitidas por tipo de medio
    'allowed_extensions' => [
        'image' => ['jpg', 'jpeg', 'png', 'gif'],
        'video' => ['mp4', 'webm']
    ],
];