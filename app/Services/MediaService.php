<?php

namespace App\Services;

use App\Enums\MediaType;
use App\Models\Espacio;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

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
        Log::warning('Imagen principal no encontrada para espacio:', [
            'espacio' => $espacio->nombre,
            'rutas_verificadas' => $possiblePaths
        ]);

        return asset('storage/' . Config::get('media.placeholders.image'));
    }

    /**
     * Obtiene todos los medios asociados a un espacio
     *
     * @param Espacio $espacio
     * @return array
     */
    public function getGalleryMedia(Espacio $espacio): array
    {
        $baseDir = $this->getEspacioBasePath($espacio);
        $media = [];

        try {
            $media = array_merge(
                $this->processImages($espacio, $baseDir),
                $this->processVideos($espacio, $baseDir)
            );

            Log::info('Galería procesada correctamente', [
                'espacio' => $espacio->nombre,
                'total_medios' => count($media)
            ]);
        } catch (\Exception $e) {
            Log::error('Error procesando galería:', [
                'espacio' => $espacio->nombre,
                'error' => $e->getMessage()
            ]);
        }

        return $media;
    }

    /**
     * Obtiene la ruta base para un espacio
     *
     * @param Espacio $espacio
     * @return string
     */
    private function getEspacioBasePath(Espacio $espacio): string
    {
        return Config::get('media.paths.espacios.base') . '/' . $espacio->slug;
    }

    /**
     * Procesa las imágenes del espacio
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
     * Procesa los videos del espacio
     *
     * @param Espacio $espacio
     * @param string $baseDir
     * @return array
     */
    private function processVideos(Espacio $espacio, string $baseDir): array
{
    $videos = [];
    $videoDir = Config::get('media.paths.espacios.videos') . '/' . $espacio->slug;

    if (!Storage::disk($this->disk)->exists($videoDir)) {
        Log::warning('Directorio de videos no encontrado:', ['directorio' => $videoDir]);
        return $videos;
    }

    $files = Storage::disk($this->disk)->files($videoDir);

    foreach ($files as $video) {
        $extension = strtolower(pathinfo($video, PATHINFO_EXTENSION));
        if (in_array($extension, ['mp4', 'webm'])) {
            $videos[] = [
                'type' => 'video',
                'url' => asset("storage/{$video}"),
                'is_main' => false,
                'mime_type' => "video/{$extension}",
                'isVideo' => true
            ];
            
            Log::info('Video procesado:', [
                'espacio' => $espacio->nombre,
                'video' => $video
            ]);
        }
    }

    return $videos;
}

    /**
     * Obtiene la ruta del thumbnail para un video
     *
     * @param string $baseDir
     * @param string $video
     * @param string $extension
     * @return string
     */
    private function getVideoThumbnailPath(string $baseDir, string $video, string $extension): string
    {
        $thumbnailsDir = Config::get('media.paths.espacios.thumbnails');
        return $baseDir . '/' . $thumbnailsDir . '/' .
            basename($video, '.' . $extension) . '.' .
            Config::get('media.thumbnails.format', 'jpg');
    }

    /**
     * Obtiene la URL del thumbnail para un video
     *
     * @param string $thumbnailPath
     * @return string
     */
    private function getVideoThumbnailUrl(string $thumbnailPath): string
    {
        return Storage::disk($this->disk)->exists($thumbnailPath)
            ? asset("storage/{$thumbnailPath}")
            : asset('storage/' . Config::get('media.placeholders.video'));
    }
}
