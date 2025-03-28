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
    // Asegúrate de que tengas esta relación
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'espacio_id');
    }

    public function bloqueos()
    {
        return $this->hasMany(Bloqueo::class);
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
     * Asegura que la imagen principal siempre esté incluida en la galería.
     *
     * @return array Array de medios con sus propiedades
     */
    public function getGalleryMediaAttribute(): array
    {
        try {
            // Variable para almacenar el resultado final de la galería
            $galleryMedia = [];
            $mainImageIncluded = false;
            
            // Intentar procesar datos crudos de la base de datos si están disponibles
            $rawGalleryData = DB::table('espacios')
                ->where('id', $this->id)
                ->value('gallery');
            
            if ($rawGalleryData && is_string($rawGalleryData)) {
                $decodedGallery = json_decode($rawGalleryData, true);
                if (is_array($decodedGallery) && !empty($decodedGallery)) {
                    // Procesar elementos de la galería desde datos crudos
                    foreach ($decodedGallery as $path) {
                        // Detectar si es imagen o video basado en la extensión
                        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                        $isVideo = in_array($extension, ['mp4', 'webm', 'ogg', 'mov']);
                        
                        $isMainImage = ($path === $this->image);
                        // Marcar si la imagen principal ya está incluida
                        if ($isMainImage) {
                            $mainImageIncluded = true;
                        }
                        
                        $galleryItem = [
                            'type' => $isVideo ? 'video' : 'image',
                            'url' => asset("storage/{$path}"),
                            'thumbnail' => $isVideo ? asset('storage/placeholders/video.jpg') : asset("storage/{$path}"),
                            'is_main' => $isMainImage
                        ];
                        
                        // Para videos, añadir información adicional
                        if ($isVideo) {
                            $galleryItem['mime_type'] = "video/{$extension}";
                        }
                        
                        $galleryMedia[] = $galleryItem;
                    }
                }
            }
            
            // Si no se encontraron elementos en la db directa, intentar con el atributo gallery del modelo
            if (empty($galleryMedia)) {
                // Verificar si tenemos datos en el campo gallery
                if (!empty($this->gallery) && is_array($this->gallery)) {
                    foreach ($this->gallery as $path) {
                        // Detectar si es imagen o video basado en la extensión
                        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                        $isVideo = in_array($extension, ['mp4', 'webm', 'ogg', 'mov']);
                        
                        $isMainImage = ($path === $this->image);
                        // Marcar si la imagen principal ya está incluida
                        if ($isMainImage) {
                            $mainImageIncluded = true;
                        }
                        
                        $galleryItem = [
                            'type' => $isVideo ? 'video' : 'image',
                            'url' => asset("storage/{$path}"),
                            'thumbnail' => $isVideo ? asset('storage/placeholders/video.jpg') : asset("storage/{$path}"),
                            'is_main' => $isMainImage
                        ];
                        
                        // Para videos, añadir información adicional
                        if ($isVideo) {
                            $galleryItem['mime_type'] = "video/{$extension}";
                        }
                        
                        $galleryMedia[] = $galleryItem;
                    }
                }
            }
            
            // Si no hay datos en gallery o está vacío, delegamos al MediaService
            if (empty($galleryMedia)) {
                $galleryMedia = $this->mediaService->getGalleryMedia($this);
                
                // Verificar si alguna imagen en la galería del servicio es la principal
                foreach ($galleryMedia as $item) {
                    if (isset($item['is_main']) && $item['is_main']) {
                        $mainImageIncluded = true;
                        break;
                    }
                }
            }
            
            // SOLUCIÓN: Asegurarse de que la imagen principal siempre esté incluida en la galería
            // y aparezca como la primera imagen
            if ($this->image && !$mainImageIncluded) {
                $mainImageUrl = $this->image_url; // Usamos el accessor que ya maneja errores
                
                // Crear el elemento para la imagen principal
                $mainImageItem = [
                    'type' => 'image',
                    'url' => $mainImageUrl,
                    'thumbnail' => $mainImageUrl,
                    'is_main' => true
                ];
                
                // Insertar la imagen principal al inicio del array
                array_unshift($galleryMedia, $mainImageItem);
            }
            
            return $galleryMedia;
            
        } catch (\Exception $e) {
            Log::error('Error procesando galería de medios:', [
                'espacio_id' => $this->id,
                'espacio_nombre' => $this->nombre,
                'error' => $e->getMessage()
            ]);
            
            // En caso de error, intentar usar el MediaService como fallback
            try {
                $serviceGallery = $this->mediaService->getGalleryMedia($this);
                
                // Asegurarse de que incluso en el fallback la imagen principal esté incluida
                $mainImageIncluded = false;
                foreach ($serviceGallery as $item) {
                    if (isset($item['is_main']) && $item['is_main']) {
                        $mainImageIncluded = true;
                        break;
                    }
                }
                
                // Añadir la imagen principal si no está incluida
                if ($this->image && !$mainImageIncluded) {
                    $mainImageUrl = $this->image_url;
                    array_unshift($serviceGallery, [
                        'type' => 'image',
                        'url' => $mainImageUrl,
                        'thumbnail' => $mainImageUrl,
                        'is_main' => true
                    ]);
                }
                
                return $serviceGallery;
            } catch (\Exception $innerException) {
                Log::error('Error en fallback de MediaService:', [
                    'error' => $innerException->getMessage()
                ]);
                
                // Si todo falla pero tenemos una imagen principal, al menos devolver esa
                if ($this->image) {
                    return [[
                        'type' => 'image',
                        'url' => $this->image_url,
                        'thumbnail' => $this->image_url,
                        'is_main' => true
                    ]];
                }
                
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