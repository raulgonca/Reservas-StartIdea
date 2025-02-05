<?php 

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Escritorio;

class EscritorioSeeder extends Seeder
{
    public function run()
    {
        // Escritorios para Coworking Sala Compartida 1
        for ($i = 1; $i <= 6; $i++) {
            Escritorio::create([
                'espacio_id' => 4, // ID de Coworking Sala Compartida 1
                'nombre' => 'Escritorio ' . $i,
                'disponible' => true,
            ]);
        }

        // Escritorios para Coworking Sala Compartida 2
        for ($i = 1; $i <= 6; $i++) {
            Escritorio::create([
                'espacio_id' => 5, // ID de Coworking Sala Compartida 2
                'nombre' => 'Escritorio ' . ($i + 6),
                'disponible' => true,
            ]);
        }

        // Escritorios para Despacho Privado
        for ($i = 1; $i <= 2; $i++) {
            Escritorio::create([
                'espacio_id' => 6, // ID de Despacho Privado
                'nombre' => 'Escritorio ' . ($i + 12),
                'disponible' => true,
            ]);
        }
    }
}