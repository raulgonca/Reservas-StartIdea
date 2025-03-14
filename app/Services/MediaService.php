<?php
// filepath: c:\Users\alber\Desktop\Start-Idea\reservas-laravel\reservas\app\Services\MediaService.php

namespace App\Services;

use App\Enums\MediaType;
use App\Models\Espacio;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Http\UploadedFile;

class MediaService
{
    /**
     * El disco de almacenamiento a utilizar
     *
     * @var string
     */
    private string $disk;

    /**
     * Constructor del servicio
     */
    public function __construct()
    {
        $this->disk = Config::get('media.storage_disk', 'public');
    }

    /**
     * Obtiene la URL de la imagen principal del espacio
     *
     * @param Espacio $espacio
     * @return string
     */
    public function getMainImageUrl(Espacio $espacio): string
    {
        $baseDir = $this->getEspacioBasePath($espacio);
        $imagePath = $espacio->image;

        // Verificar si existe la imagen principal definida
        if ($imagePath && Storage::disk($this->disk)->exists($imagePath)) {
            return asset("storage/{$imagePath}");
        }

        // Buscar en ubicaciones alternativas
        $possiblePaths = [
            $imagePath,
            $baseDir . '/' . basename($imagePath),
            $baseDir . '/main.jpg',
            $baseDir . '/' . $espacio->slug . '.jpg'
        ];

        foreach ($possiblePaths as $path) {
            if ($path && Storage::disk($this->disk)->exists($path)) {
                return asset("storage/{$path}");
            }
        }

        // Si no se encuentra ninguna imagen, retornar placeholder
        return asset('storage/' . Config::get('media.placeholders.image', 'placeholders/image.jpg'));
    }

    /**
     * Obtiene todos los medios asociados a un espacio
     *
     * @param Espacio $espacio
     * @return array
     */
    public function getGalleryMedia(Espacio $espacio): array
    {
        // Primero intentar obtener medios desde el campo gallery
        $mediaFromDB = $this->processGalleryFromDB($espacio);
        
        // Si encontramos medios en la base de datos, los usamos
        if (!empty($mediaFromDB)) {
            Log::debug('Usando datos de gallery de la base de datos', [
                'espacio_id' => $espacio->id,
                'items_count' => count($mediaFromDB)
            ]);
            return $mediaFromDB;
        }
        
        // Si no hay nada en la BD, intentamos el método antiguo
        $baseDir = $this->getEspacioBasePath($espacio);
        $media = [];

        try {
            $media = array_merge(
                $this->processImages($espacio, $baseDir),
                $this->processVideos($espacio, $baseDir)
            );
            
            if (!empty($media)) {
                Log::debug('Encontrados medios usando el método antiguo', [
                    'espacio_id' => $espacio->id,
                    'items_count' => count($media)
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error procesando galería con método antiguo:', [
                'espacio' => $espacio->nombre,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $media;
    }

    /**
     * Procesa medios guardados en el campo gallery de la base de datos
     *
     * @param Espacio $espacio
     * @return array
     */
    private function processGalleryFromDB(Espacio $espacio): array
    {
        $galleryItems = [];
        
        // Si gallery es null, utilizamos un array vacío para el procesamiento
        $galleryData = $espacio->gallery ?? [];
        
        if (!empty($galleryData) && is_array($galleryData)) {
            Log::debug('Gallery items encontrados en DB:', ['count' => count($galleryData)]);
            
            foreach ($galleryData as $path) {
                if (Storage::disk($this->disk)->exists($path)) {
                    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                    $isVideo = in_array($extension, ['mp4', 'webm', 'ogg', 'mov']);
                    
                    $item = [
                        'type' => $isVideo ? 'video' : 'image',
                        'url' => asset("storage/{$path}"),
                        'is_main' => ($path === $espacio->image)
                    ];
                    
                    // Para imágenes, la miniatura es la misma URL
                    if (!$isVideo) {
                        $item['thumbnail'] = asset("storage/{$path}");
                    } 
                    // Para videos, generar o usar una miniatura
                    else {
                        $thumbnailPath = $this->getOrGenerateVideoThumbnail($path);
                        $item['thumbnail'] = asset("storage/{$thumbnailPath}");
                        $item['mime_type'] = "video/{$extension}";
                    }
                    
                    $galleryItems[] = $item;
                } else {
                    Log::warning('Archivo de galería no encontrado:', ['path' => $path]);
                }
            }
        } else {
            Log::debug('No se encontraron items en gallery o no es array', [
                'gallery_empty' => empty($espacio->gallery),
                'gallery_is_array' => is_array($espacio->gallery),
                'gallery_value' => $espacio->gallery
            ]);
        }
        
        return $galleryItems;
    }

    /**
     * Genera o recupera la miniatura de un video
     *
     * @param string $videoPath Ruta del video
     * @return string Ruta de la miniatura
     */
    public function getOrGenerateVideoThumbnail(string $videoPath): string
    {
        $thumbnailPath = str_replace('.' . pathinfo($videoPath, PATHINFO_EXTENSION), '_thumb.jpg', $videoPath);
        
        // Verificar si ya existe la miniatura
        if (Storage::disk($this->disk)->exists($thumbnailPath)) {
            return $thumbnailPath;
        }
        
        // Intentar generar miniatura si tenemos FFmpeg
        try {
            // Verificar si FFmpeg está disponible
            exec('ffmpeg -version', $output, $returnCode);
            
            if ($returnCode === 0) {
                // FFmpeg está instalado, generar miniatura
                $videoFullPath = storage_path('app/public/' . $videoPath);
                $thumbnailFullPath = storage_path('app/public/' . $thumbnailPath);
                
                // Asegurarse que exista el directorio
                $thumbnailDir = dirname($thumbnailFullPath);
                if (!is_dir($thumbnailDir)) {
                    mkdir($thumbnailDir, 0755, true);
                }
                
                // Generar miniatura tomando el frame al 1 segundo
                $command = "ffmpeg -i \"{$videoFullPath}\" -ss 00:00:01 -vframes 1 \"{$thumbnailFullPath}\"";
                exec($command, $output, $returnCode);
                
                if ($returnCode === 0 && file_exists($thumbnailFullPath)) {
                    Log::info('Miniatura de video generada correctamente', [
                        'video' => $videoPath,
                        'thumbnail' => $thumbnailPath
                    ]);
                    return $thumbnailPath;
                }
            }
        } catch (\Exception $e) {
            Log::warning('Error al intentar generar miniatura con FFmpeg', [
                'error' => $e->getMessage()
            ]);
        }
        
        // Si no se pudo generar, devolver placeholder
        return Config::get('media.placeholders.video', 'placeholders/video.jpg');
    }

    /**
     * Obtiene la ruta base para un espacio
     *
     * @param Espacio $espacio
     * @return string
     */
    private function getEspacioBasePath(Espacio $espacio): string
    {
        return Config::get('media.paths.espacios.base', 'espacios') . '/' . $espacio->slug;
    }

    /**
     * Procesa las imágenes del espacio (método antiguo)
     *
     * @param Espacio $espacio
     * @param string $baseDir
     * @return array
     */
    private function processImages(Espacio $espacio, string $baseDir): array
    {
        $images = [];

        if (!Storage::disk($this->disk)->exists($baseDir)) {
            return $images;
        }

        $files = Storage::disk($this->disk)->files($baseDir);

        foreach ($files as $file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (MediaType::IMAGE->isValidExtension($extension)) {
                $images[] = [
                    'type' => MediaType::IMAGE->value,
                    'url' => asset("storage/{$file}"),
                    'thumbnail' => asset("storage/{$file}"),
                    'is_main' => ($file === $espacio->image)
                ];
            }
        }

        return $images;
    }

    /**
     * Procesa los videos del espacio (método antiguo)
     *
     * @param Espacio $espacio
     * @param string $baseDir
     * @return array
     */
    private function processVideos(Espacio $espacio, string $baseDir): array
    {
        $videos = [];
        $videoDir = Config::get('media.paths.espacios.videos', 'espacios') . '/' . $espacio->slug;

        if (!Storage::disk($this->disk)->exists($videoDir)) {
            return $videos;
        }

        $files = Storage::disk($this->disk)->files($videoDir);

        foreach ($files as $video) {
            $extension = strtolower(pathinfo($video, PATHINFO_EXTENSION));
            if (in_array($extension, ['mp4', 'webm', 'ogg', 'mov'])) {
                $thumbnailPath = $this->getOrGenerateVideoThumbnail($video);
                
                $videos[] = [
                    'type' => 'video',
                    'url' => asset("storage/{$video}"),
                    'thumbnail' => asset("storage/{$thumbnailPath}"),
                    'is_main' => false,
                    'mime_type' => "video/{$extension}"
                ];
            }
        }

        return $videos;
    }

    /**
     * Genera una miniatura para un archivo de video recién subido
     *
     * @param string $videoPath Ruta donde se guardó el video
     * @return string Ruta de la miniatura generada o placeholder
     */
    public function generateVideoThumbnail(string $videoPath): string
    {
        return $this->getOrGenerateVideoThumbnail($videoPath);
    }

    /**
     * Procesa un archivo subido y lo guarda en storage
     * 
     * @param UploadedFile $file Archivo subido
     * @param string $path Ruta donde guardar el archivo
     * @param string $disk Disco de almacenamiento a usar
     * @return array Datos del archivo procesado
     */
    public function processUploadedFile(UploadedFile $file, string $path, string $disk = null): array
    {
        $disk = $disk ?? $this->disk;
        $mimeType = $file->getMimeType();
        $isVideo = strpos($mimeType, 'video/') === 0;
        
        // Guardar el archivo
        $savedPath = $file->store($path, $disk);
        
        $result = [
            'path' => $savedPath,
            'type' => $isVideo ? 'video' : 'image',
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
        ];
        
        // Si es video, generar miniatura
        if ($isVideo) {
            $result['thumbnail'] = $this->generateVideoThumbnail($savedPath);
        }
        
        return $result;
    }

    /**
     * Elimina un archivo y sus recursos asociados (ej: miniaturas)
     * 
     * @param string $path Ruta del archivo
     * @param string $disk Disco de almacenamiento
     * @return bool Éxito de la operación
     */
    public function deleteFile(string $path, string $disk = null): bool
    {
        $disk = $disk ?? $this->disk;
        $success = false;
        
        // Verificar si el archivo existe
        if (Storage::disk($disk)->exists($path)) {
            // Determinar si es un video
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $isVideo = in_array($extension, ['mp4', 'webm', 'ogg', 'mov']);
            
            // Si es video, eliminar también la miniatura si existe
            if ($isVideo) {
                $thumbnailPath = str_replace('.' . $extension, '_thumb.jpg', $path);
                if (Storage::disk($disk)->exists($thumbnailPath)) {
                    Storage::disk($disk)->delete($thumbnailPath);
                }
            }
            
            // Eliminar el archivo principal
            $success = Storage::disk($disk)->delete($path);
        }
        
        return $success;
    }
}