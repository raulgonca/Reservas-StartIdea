<?php

namespace App\Console\Commands;

use App\Models\Espacio;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class VerifyImages extends Command
{
    protected $signature = 'images:verify';
    protected $description = 'Verifica la existencia de imágenes de espacios';

    public function handle()
    {
        $espacios = Espacio::all();
        
        foreach ($espacios as $espacio) {
            $this->info("Verificando espacio: {$espacio->nombre}");
            $path = 'public/' . $espacio->image;
            
            if (Storage::exists($path)) {
                $this->info("✅ Imagen encontrada: {$path}");
            } else {
                $this->error("❌ Imagen no encontrada: {$path}");
                $this->info("Ruta completa: " . Storage::path($path));
            }
        }
    }
}
