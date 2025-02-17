<?php

namespace Database\Seeders;

use App\Models\Espacio;
use App\Models\Escritorio;
use Illuminate\Database\Seeder;

class EscritorioSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener solo espacios de tipo coworking
        $espaciosCoworking = Espacio::where('tipo', 'coworking')->get();

        foreach ($espaciosCoworking as $espacio) {
            // Crear 6 escritorios por cada espacio coworking
            for ($i = 1; $i <= 6; $i++) {
                Escritorio::create([
                    'espacio_id' => $espacio->id,
                    'numero' => 'E' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'is_active' => true
                ]);
            }
        }
    }
}