<?php

namespace App\Enums;

enum MediaType: string
{
    case IMAGE = 'image';
    case VIDEO = 'video';

    /**
     * Obtiene las extensiones permitidas para cada tipo de medio
     */
    public function getAllowedExtensions(): array
    {
        return match($this) {
            self::IMAGE => ['jpg', 'jpeg', 'png', 'gif'],
            self::VIDEO => ['mp4', 'webm']
        };
    }

    /**
     * Determina si una extensión es válida para este tipo de medio
     */
    public function isValidExtension(string $extension): bool
    {
        return in_array(strtolower($extension), $this->getAllowedExtensions());
    }
}