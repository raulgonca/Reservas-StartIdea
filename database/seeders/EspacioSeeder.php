<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Espacio;
use Illuminate\Support\Str;

class EspacioSeeder extends Seeder
{
    public function run()
    {
        $espacios = [
            [
                'nombre' => 'CC33',
                'tipo' => 'sala',
                'aforo' => 30,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Sala con aforo para 30 personas aprox.',
                'image' => 'images/espacios/cc33.jpg',
                'features' => json_encode(['WiFi', 'Proyector', 'Aire acondicionado', 'Pizarra']),
                'price' => 35.00,
                'is_active' => true
            ],
            [
                'nombre' => 'SERENDIPIA',
                'tipo' => 'sala',
                'aforo' => 40,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Sala con aforo para 40 personas aprox.',
                'image' => 'images/espacios/serendipia.jpg',
                'features' => json_encode(['WiFi', 'Proyector', 'Aire acondicionado', 'Pizarra']),
                'price' => 45.00,
                'is_active' => true
            ],
            [
                'nombre' => 'SÓCRATES',
                'tipo' => 'sala',
                'aforo' => 20,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Sala con aforo para 20 personas aprox.',
                'image' => 'images/espacios/socrates.jpg',
                'features' => json_encode(['WiFi', 'Proyector', 'Aire acondicionado', 'Pizarra']),
                'price' => 25.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Coworking Sala Compartida 1',
                'tipo' => 'coworking',
                'aforo' => null,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Espacio de coworking en sala compartida.',
                'image' => 'images/espacios/coworking1.jpg',
                'features' => json_encode(['WiFi', 'Escritorios', 'Aire acondicionado', 'Cafetería']),
                'price' => 15.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Coworking Sala Compartida 2',
                'tipo' => 'coworking',
                'aforo' => null,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Espacio de coworking en sala compartida.',
                'image' => 'images/espacios/coworking2.jpg',
                'features' => json_encode(['WiFi', 'Escritorios', 'Aire acondicionado', 'Cafetería']),
                'price' => 15.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Despacho Privado',
                'tipo' => 'despacho',
                'aforo' => null,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '18:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Despacho privado.',
                'image' => 'images/espacios/despacho.jpg',
                'features' => json_encode(['WiFi', 'Escritorio', 'Aire acondicionado', 'Privacidad']),
                'price' => 25.00,
                'is_active' => true
            ],
            [
                'nombre' => 'Radio',
                'tipo' => 'radio',
                'aforo' => 6,
                'horario_inicio' => '08:00:00',
                'horario_fin' => '21:00:00',
                'disponible_24_7' => false,
                'descripcion' => 'Radio con aforo para 6 personas aprox.',
                'image' => 'images/espacios/radio.jpg',
                'features' => json_encode(['WiFi', 'Equipamiento de radio', 'Aire acondicionado', 'Insonorizado']),
                'price' => 40.00,
                'is_active' => true
            ],
        ];

        foreach ($espacios as $espacio) {
            $espacio['slug'] = Str::slug($espacio['nombre']);
            Espacio::create($espacio);
        }
    }
}