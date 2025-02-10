<?php

namespace Database\Seeders;

use App\Models\Reserva;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use Illuminate\Database\Seeder;

class ReservaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todos los usuarios, espacios y escritorios
        $users = User::all();
        $espacios = Espacio::all();
        $escritorios = Escritorio::all();

        // Generar 50 reservas con estados aleatorios
        Reserva::factory()->count(50)->make()->each(function ($reserva) use ($users, $espacios, $escritorios) {
            $reserva->user_id = $users->random()->id;
            $reserva->espacio_id = $espacios->random()->id;
            $reserva->escritorio_id = $escritorios->random()->id;
            $reserva->estado = collect(['confirmada', 'pendiente', 'cancelada'])->random();
            $reserva->save();
        });
    }
}