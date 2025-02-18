<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class Espacio extends Model
{
    use HasFactory;

    /**
     * Atributos que son asignables masivamente.
     *
     * @var array<string>
     */
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

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2'
    ];

    /**
     * Los atributos que deben ser anexados a las matrices.
     *
     * @var array<string>
     */
    protected $appends = ['image_url', 'gallery_media'];

    /**
     * Obtiene las reservas asociadas al espacio.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * Obtiene los escritorios asociados al espacio.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function escritorios()
    {
        return $this->hasMany(Escritorio::class);
    }

    /**
     * Obtiene la URL de la imagen principal del espacio.
     *
     * @return string
     */
    public function getImageUrlAttribute()
    {
        $baseDir = 'images/espacios/' . $this->slug;
        
        // Log para depuración
        Log::info('Verificando imagen principal:', [
            'espacio' => $this->nombre,
            'directorio_base' => $baseDir,
            'imagen' => $this->image
        ]);

        // Verificar imagen principal
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            return asset('storage/' . $this->image);
        }

        // Buscar alternativas
        $posiblePaths = [
            $this->image,
            $baseDir . '/' . basename($this->image),
            $baseDir . '/main.jpg',
            $baseDir . '/' . $this->slug . '.jpg'
        ];

        foreach ($posiblePaths as $path) {
            if (Storage::disk('public')->exists($path)) {
                return asset('storage/' . $path);
            }
        }

        return asset('storage/images/placeholder.png');
    }

    /**
     * Obtiene la galería completa de medios del espacio.
     *
     * @return array
     */
    public function getGalleryMediaAttribute()
    {
        $baseDir = 'images/espacios/' . $this->slug;
        $media = [];

        try {
            // Obtener todas las imágenes del directorio
            if (Storage::disk('public')->exists($baseDir)) {
                $files = Storage::disk('public')->files($baseDir);
                
                // Log para depuración
                Log::info('Archivos encontrados:', [
                    'espacio' => $this->nombre,
                    'directorio' => $baseDir,
                    'archivos' => $files
                ]);

                // Procesar imágenes
                foreach ($files as $file) {
                    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                        $media[] = [
                            'type' => 'image',
                            'url' => asset('storage/' . $file),
                            'thumbnail' => asset('storage/' . $file),
                            'is_main' => ($file === $this->image)
                        ];
                    }
                }

                // Procesar videos si existen
                $videoDir = $baseDir . '/videos';
                if (Storage::disk('public')->exists($videoDir)) {
                    $videos = Storage::disk('public')->files($videoDir);
                    foreach ($videos as $video) {
                        $extension = strtolower(pathinfo($video, PATHINFO_EXTENSION));
                        if (in_array($extension, ['mp4', 'webm'])) {
                            $thumbnailPath = $baseDir . '/thumbnails/' . basename($video, '.' . $extension) . '.jpg';
                            $media[] = [
                                'type' => 'video',
                                'url' => asset('storage/' . $video),
                                'thumbnail' => Storage::disk('public')->exists($thumbnailPath)
                                    ? asset('storage/' . $thumbnailPath)
                                    : asset('storage/images/video-placeholder.png'),
                                'is_main' => false
                            ];
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Error procesando galería:', [
                'espacio' => $this->nombre,
                'error' => $e->getMessage()
            ]);
        }

        return $media;
    }
}