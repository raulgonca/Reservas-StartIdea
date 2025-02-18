<?php

namespace Database\Seeders;

use App\Models\Espacio;
use Illuminate\Database\Seeder;

class EspacioSeeder extends Seeder
{
    public function run()
    {
        $espacios = [
            [
                'nombre' => 'CC33',
                'slug' => 'cc33',
                'tipo' => 'sala',
                'aforo' => 30,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Sala con aforo para 30 personas aprox. Equipada con...',
                'image' => 'images/espacios/cc33/cc33.jpg',
                'features' => json_encode(['WiFi', 'Proyector', 'Aire acondicionado']),
                'price' => 35.00,
                'is_active' => true
            ],
            [
                'nombre' => 'SERENDIPIA',
                'slug' => 'serendipia',
                'tipo' => 'sala',
                'aforo' => 40,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Sala con aforo para 40 personas aprox. Equipada con...',
                'image' => 'images/espacios/serendipia/serendipia.jpg',
                'features' => json_encode(['WiFi', 'Proyector', 'Aire acondicionado']),
                'price' => 45.00,
                'is_active' => true
            ],
            [
                'nombre' => 'SÓCRATES',
                'slug' => 'socrates',
                'tipo' => 'sala',
                'aforo' => 20,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Sala con aforo para 20 personas aprox. Equipada con...',
                'image' => 'images/espacios/socrates/socrates.jpg',
                'features' => json_encode(['WiFi', 'Proyector', 'Aire acondicionado']),
                'price' => 25.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Coworking Sala Compartida 1',
                'slug' => 'coworking-sala-compartida-1',
                'tipo' => 'coworking',
                'aforo' => null,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Espacio de coworking en sala compartida. Equipada con...',
                'image' => 'images/espacios/coworking1/coworking1.jpg',
                'features' => json_encode(['WiFi', 'Escritorios', 'Aire acondicionado']),
                'price' => 15.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Coworking Sala Compartida 2',
                'slug' => 'coworking-sala-compartida-2',
                'tipo' => 'coworking',
                'aforo' => null,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Espacio de coworking en sala compartida. Equipada con...',
                'image' => 'images/espacios/coworking2/coworking2.jpg',
                'features' => json_encode(['WiFi', 'Escritorios', 'Aire acondicionado']),
                'price' => 15.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Despacho Privado',
                'slug' => 'despacho-privado',
                'tipo' => 'despacho',
                'aforo' => null,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Despacho privado. Equipada con...',
                'image' => 'images/espacios/despacho/despacho.jpg',
                'features' => json_encode(['WiFi', 'Escritorio', 'Aire acondicionado']),
                'price' => 25.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Radio',
                'slug' => 'radio',
                'tipo' => 'radio',
                'aforo' => 6,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '21:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Radio con aforo para 6 personas aprox. Equipada con...',
                'image' => 'images/espacios/radio/radio.jpg',
                'features' => json_encode(['WiFi', 'Equipamiento de radio', 'Aire acondicionado']),
                'price' => 40.00,
                'is_active' => true
            ],
        ];

        foreach ($espacios as $espacioData) {
            $espacio = Espacio::where('slug', $espacioData['slug'])->first();
            
            if ($espacio) {
                $espacio->update($espacioData);
            } else {
                Espacio::create($espacioData);
            }
        }
    }
}