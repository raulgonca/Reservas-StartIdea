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
        Log::channel('daily')->info('Generando URL de imagen:', [
            'espacio' => $this->nombre,
            'imagen_original' => $this->image,
            'ruta_storage' => storage_path('app/public'),
            'existe_archivo' => Storage::exists('public/' . $this->image)
        ]);

        if ($this->image && Storage::exists('public/' . $this->image)) {
            return asset('storage/' . $this->image);
        }

        Log::channel('daily')->warning('Imagen no encontrada, usando placeholder');
        return asset('storage/images/placeholder.png');
    }

    public function getGalleryImagesAttribute()
    {
        if (!$this->image) return [];
        
        $directory = dirname($this->image);
        $files = Storage::files('public/' . $directory);
        
        return collect($files)
            ->map(fn($file) => [
                'url' => asset('storage/' . str_replace('public/', '', $file)),
                'name' => basename($file)
            ])
            ->values()
            ->all();
    }
}
