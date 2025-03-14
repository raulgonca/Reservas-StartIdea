<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
        'gallery',         // Rutas de las imágenes/videos de la galería (array)
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
        'gallery' => 'array',         // Convierte gallery a/desde JSON
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
            return asset('storage/' . config('media.placeholders.image', 'placeholders/image.jpg'));
        }
    }

    /**
     * Obtiene toda la galería de medios del espacio.
     * Primero intenta procesar directamente el campo gallery.
     * Si no hay datos o hay un error, delega al MediaService.
     *
     * @return array Array de medios con sus propiedades
     */
    public function getGalleryMediaAttribute(): array
    {
        try {
            // DIAGNÓSTICO: Verificar datos directamente desde la base de datos
            $rawGalleryData = DB::table('espacios')
                ->where('id', $this->id)
                ->value('gallery');
            
            Log::debug('Datos de galería de la DB directamente:', [
                'espacio_id' => $this->id,
                'raw_gallery_data' => $rawGalleryData,
                'raw_gallery_type' => gettype($rawGalleryData)
            ]);
            
            // Intentar procesar datos crudos de la base de datos si están disponibles
            if ($rawGalleryData && is_string($rawGalleryData)) {
                $decodedGallery = json_decode($rawGalleryData, true);
                if (is_array($decodedGallery) && !empty($decodedGallery)) {
                    Log::debug('Gallery recuperada directamente de la DB:', [
                        'espacio_id' => $this->id,
                        'count' => count($decodedGallery),
                        'items' => $decodedGallery
                    ]);
                    
                    // Procesar elementos de la galería desde datos crudos
                    $galleryMedia = [];
                    foreach ($decodedGallery as $path) {
                        // Detectar si es imagen o video basado en la extensión
                        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                        $isVideo = in_array($extension, ['mp4', 'webm', 'ogg', 'mov']);
                        
                        $galleryItem = [
                            'type' => $isVideo ? 'video' : 'image',
                            'url' => asset("storage/{$path}"),
                            'thumbnail' => $isVideo ? asset('storage/placeholders/video.jpg') : asset("storage/{$path}"),
                            'is_main' => ($path === $this->image)
                        ];
                        
                        // Para videos, añadir información adicional
                        if ($isVideo) {
                            $galleryItem['mime_type'] = "video/{$extension}";
                        }
                        
                        $galleryMedia[] = $galleryItem;
                    }
                    
                    if (!empty($galleryMedia)) {
                        return $galleryMedia;
                    }
                }
            }
            
            // MÉTODO ORIGINAL: Intentar con el atributo gallery del modelo
            $galleryMedia = [];
            
            // Registro detallado para diagnóstico
            Log::debug('Evaluando gallery attribute desde modelo:', [
                'espacio_id' => $this->id,
                'gallery_type' => gettype($this->gallery),
                'gallery_value' => $this->gallery,
                'gallery_is_array' => is_array($this->gallery),
                'gallery_empty' => empty($this->gallery),
                'raw_attribute' => $this->attributes['gallery'] ?? 'no_raw_attribute'
            ]);
            
            // Verificar si tenemos datos en el campo gallery
            if (!empty($this->gallery) && is_array($this->gallery)) {
                foreach ($this->gallery as $path) {
                    // Detectar si es imagen o video basado en la extensión
                    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                    $isVideo = in_array($extension, ['mp4', 'webm', 'ogg', 'mov']);
                    
                    $galleryItem = [
                        'type' => $isVideo ? 'video' : 'image',
                        'url' => asset("storage/{$path}"),
                        'thumbnail' => $isVideo ? asset('storage/placeholders/video.jpg') : asset("storage/{$path}"),
                        'is_main' => ($path === $this->image)
                    ];
                    
                    // Para videos, añadir información adicional
                    if ($isVideo) {
                        $galleryItem['mime_type'] = "video/{$extension}";
                    }
                    
                    $galleryMedia[] = $galleryItem;
                }
                
                // Si encontramos elementos en la galería, los devolvemos
                if (!empty($galleryMedia)) {
                    Log::debug('Gallery procesada desde atributo del modelo:', [
                        'espacio_id' => $this->id,
                        'count' => count($galleryMedia)
                    ]);
                    return $galleryMedia;
                }
            }
            
            // Si no hay datos en gallery o está vacío, delegamos al MediaService
            $serviceGallery = $this->mediaService->getGalleryMedia($this);
            Log::debug('Gallery obtenida desde MediaService:', [
                'espacio_id' => $this->id,
                'count' => count($serviceGallery)
            ]);
            return $serviceGallery;
            
        } catch (\Exception $e) {
            Log::error('Error procesando galería de medios:', [
                'espacio_id' => $this->id,
                'espacio_nombre' => $this->nombre,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // En caso de error, intentar usar el MediaService como fallback
            try {
                return $this->mediaService->getGalleryMedia($this);
            } catch (\Exception $innerException) {
                Log::error('Error en fallback de MediaService:', [
                    'error' => $innerException->getMessage()
                ]);
                return [];
            }
        }
    }

    /**
     * Añade una imagen o video a la galería del espacio.
     *
     * @param string $path Ruta del archivo
     * @return void
     */
    public function addToGallery(string $path): void
    {
        $gallery = $this->gallery ?? [];
        if (!in_array($path, $gallery)) {
            $gallery[] = $path;
            $this->gallery = $gallery;
            
            // Registrar la operación para diagnóstico
            Log::debug('Añadida imagen a galería:', [
                'espacio_id' => $this->id,
                'path' => $path,
                'gallery_count' => count($this->gallery)
            ]);
        }
    }

    /**
     * Elimina una imagen o video de la galería.
     *
     * @param string $path Ruta del archivo a eliminar
     * @return void
     */
    public function removeFromGallery(string $path): void
    {
        if (!empty($this->gallery)) {
            $this->gallery = array_values(array_filter(
                $this->gallery,
                function ($item) use ($path) {
                    return $item !== $path;
                }
            ));
            
            // Registrar la operación para diagnóstico
            Log::debug('Eliminada imagen de galería:', [
                'espacio_id' => $this->id,
                'path' => $path,
                'gallery_count' => count($this->gallery)
            ]);
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