<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Espacio;

class EspacioSeeder extends Seeder
{
    public function run()
    {
        // Salas
        Espacio::create([
            'nombre' => 'CC33',
            'tipo' => 'sala',
            'aforo' => 30,
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false,
            'descripcion' => 'Sala con aforo para 30 personas aprox.',
        ]);

        Espacio::create([
            'nombre' => 'SERENDIPIA',
            'tipo' => 'sala',
            'aforo' => 40,
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false,
            'descripcion' => 'Sala con aforo para 40 personas aprox.',
        ]);

        Espacio::create([
            'nombre' => 'SÓCRATES',
            'tipo' => 'sala',
            'aforo' => 20,
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false,
            'descripcion' => 'Sala con aforo para 20 personas aprox.',
        ]);

        // Espacios de coworking
        Espacio::create([
            'nombre' => 'Coworking Sala Compartida 1',
            'tipo' => 'coworking',
            'aforo' => null,
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false,
            'descripcion' => 'Espacio de coworking en sala compartida.',
        ]);

        Espacio::create([
            'nombre' => 'Coworking Sala Compartida 2',
            'tipo' => 'coworking',
            'aforo' => null,
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false,
            'descripcion' => 'Espacio de coworking en sala compartida.',
        ]);

        Espacio::create([
            'nombre' => 'Despacho Privado',
            'tipo' => 'despacho',
            'aforo' => null,
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false,
            'descripcion' => 'Despacho privado.',
        ]);
    }
}