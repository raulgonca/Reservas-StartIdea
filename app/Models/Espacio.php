<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class Espacio extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'slug',
        'tipo',
        'aforo',
        'horario_inicio',
        'horario_fin',
        'disponible_24_7',
        'descripcion',
        'image',
        'features',
        'price',
        'is_active'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2'
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function escritorios()
    {
        return $this->hasMany(Escritorio::class);
    }

    protected $appends = ['image_url', 'gallery_images'];

    // Accessor para la URL de la imagen
    public function getImageUrlAttribute()
{
    // Log para depuración de rutas absolutas
    Log::info('Verificando rutas de imagen:', [
        'espacio' => $this->nombre,
        'ruta_base' => storage_path('app/public'),
        'ruta_imagen' => $this->image,
        'ruta_completa' => storage_path('app/public/' . $this->image)
    ]);

    // Verificar si la imagen existe directamente
    if ($this->image && Storage::disk('public')->exists($this->image)) {
        return asset('storage/' . $this->image);
    }

    // Verificar en diferentes ubicaciones posibles
    $posiblePaths = [
        $this->image,
        'images/espacios/' . $this->slug . '/' . basename($this->image),
        'images/espacios/' . $this->slug . '/main.jpg'
    ];

    foreach ($posiblePaths as $path) {
        if (Storage::disk('public')->exists($path)) {
            return asset('storage/' . $path);
        }
    }

    return asset('storage/images/placeholder.png');
}

    public function getGalleryMediaAttribute()
    {
        if (!$this->image) return [];

        $directory = 'images/espacios/' . $this->slug;
        $images = Storage::files('public/' . $directory);
        $videos = Storage::files('public/' . $directory . '/videos');

        $media = [];
        $allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        $allowedVideoExtensions = ['.mp4', '.webm'];

        // Procesar imágenes
        foreach ($images as $image) {
            $extension = strtolower(pathinfo($image, PATHINFO_EXTENSION));
            if (in_array('.' . $extension, $allowedImageExtensions)) {
                $media[] = [
                    'type' => 'image',
                    'url' => asset('storage/' . str_replace('public/', '', $image)),
                    'thumbnail' => asset('storage/' . str_replace('public/', '', $image))
                ];
            }
        }

        // Procesar videos
        foreach ($videos as $video) {
            $extension = strtolower(pathinfo($video, PATHINFO_EXTENSION));
            if (in_array('.' . $extension, $allowedVideoExtensions)) {
                $media[] = [
                    'type' => 'video',
                    'url' => asset('storage/' . str_replace('public/', '', $video)),
                    'thumbnail' => asset('storage/' . str_replace('public/', '', $directory . '/thumbnails/' . basename($video, '.mp4') . '.jpg'))
                ];
            }
        }

        return $media;
    }
}
