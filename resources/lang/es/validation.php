<?php

return [
    'accepted' => 'El campo :attribute debe ser aceptado.',
    'active_url' => 'El campo :attribute no es una URL válida.',
    'after' => 'El campo :attribute debe ser una fecha posterior a :date.',
    // Otros mensajes de validación aquí

    'custom' => [
        'name' => [
            'required' => 'El nombre es obligatorio.',
            'string' => 'El nombre debe ser una cadena de texto.',
            'max' => 'El nombre no puede tener más de 255 caracteres.',
        ],
        'email' => [
            'required' => 'El correo electrónico es obligatorio.',
            'string' => 'El correo electrónico debe ser una cadena de texto.',
            'lowercase' => 'El correo electrónico debe estar en minúsculas.',
            'email' => 'El correo electrónico debe ser una dirección válida.',
            'max' => 'El correo electrónico no puede tener más de 255 caracteres.',
            'unique' => 'El correo electrónico ya ha sido tomado.',
        ],
        'password' => [
            'required' => 'La contraseña es obligatoria.',
            'confirmed' => 'La confirmación de la contraseña no coincide.',
        ],
        'phone' => [
            'required' => 'El teléfono es obligatorio.',
            'string' => 'El teléfono debe ser una cadena de texto.',
            'max' => 'El teléfono no puede tener más de 15 caracteres.',
            'regex' => 'El teléfono debe tener un formato válido (9 dígitos, empieza con 6, 7, 8 o 9).',
        ],
        'dni' => [
            'required' => 'El DNI es obligatorio.',
            'string' => 'El DNI debe ser una cadena de texto.',
            'max' => 'El DNI no puede tener más de 20 caracteres.',
            'unique' => 'El DNI ya ha sido tomado.',
            'regex' => 'El DNI debe tener un formato válido (8 dígitos + 1 letra).',
        ],
    ],

    'attributes' => [
        'name' => 'nombre',
        'email' => 'correo electrónico',
        'password' => 'contraseña',
        'phone' => 'teléfono',
        'dni' => 'DNI',
    ],
];
