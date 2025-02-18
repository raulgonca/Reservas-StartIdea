<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Espacio extends Model
{
    use HasFactory;

    /**
     * El servicio de medios
     *
     * @var MediaService
     */
    private MediaService $mediaService;

    /**
     * Constructor del modelo
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->mediaService = new MediaService();
    }

    /**
     * Atributos que son asignables masivamente.
     *
     * @var array<string>
     */
    protected $fillable = [
        'nombre',           // Nombre del espacio
        'slug',            // URL amigable del espacio
        'tipo',            // Tipo de espacio (sala, despacho, etc.)
        'aforo',           // Capacidad máxima de personas
        'horario_inicio',  // Hora de inicio de disponibilidad
        'horario_fin',     // Hora de fin de disponibilidad
        'disponible_24_7', // Indicador de disponibilidad 24/7
        'descripcion',     // Descripción detallada del espacio
        'image',           // Ruta de la imagen principal
        'features',        // Características/amenidades (array)
        'price',           // Precio por hora/día
        'is_active'        // Estado de disponibilidad
    ];

    /**
     * Atributos que deben ser convertidos a tipos específicos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'features' => 'array',        // Convierte features a/desde JSON
        'disponible_24_7' => 'boolean', // Convierte disponible_24_7 a booleano
        'is_active' => 'boolean',     // Convierte is_active a booleano
        'price' => 'decimal:2'        // Convierte price a decimal con 2 decimales
    ];

    /**
     * Atributos computados que se agregan automáticamente a las consultas.
     *
     * @var array<string>
     */
    protected $appends = [
        'image_url',
        'gallery_media'
    ];

    /**
     * Relación con las reservas del espacio.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * Relación con los escritorios del espacio.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function escritorios()
    {
        return $this->hasMany(Escritorio::class);
    }

    /**
     * Obtiene la URL de la imagen principal del espacio.
     * Delega al MediaService la obtención de la URL.
     *
     * @return string URL de la imagen
     */
    public function getImageUrlAttribute(): string
    {
        try {
            return $this->mediaService->getMainImageUrl($this);
        } catch (\Exception $e) {
            Log::error('Error obteniendo URL de imagen principal:', [
                'espacio' => $this->nombre,
                'error' => $e->getMessage()
            ]);
            return asset('storage/' . config('media.placeholders.image'));
        }
    }

    /**
     * Obtiene toda la galería de medios del espacio.
     * Delega al MediaService la obtención de la galería.
     *
     * @return array Array de medios con sus propiedades
     */
    public function getGalleryMediaAttribute(): array
    {
        try {
            return $this->mediaService->getGalleryMedia($this);
        } catch (\Exception $e) {
            Log::error('Error obteniendo galería de medios:', [
                'espacio' => $this->nombre,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Scope para filtrar espacios activos.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActivo($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para filtrar por tipo de espacio.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $tipo
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePorTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Determina si el espacio está disponible 24/7.
     *
     * @return bool
     */
    public function isDisponible24_7(): bool
    {
        return $this->disponible_24_7;
    }

    /**
     * Determina si el espacio está actualmente activo.
     *
     * @return bool
     */
    public function isActivo(): bool
    {
        return $this->is_active;
    }
}