<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reserva;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use Illuminate\Support\Carbon;

class ReservaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener los IDs de usuarios, espacios y escritorios
        $usuarios = User::where('role', 'user')->pluck('id')->toArray();
        $espacios = Espacio::pluck('id')->toArray();
        $escritorios = Escritorio::pluck('id', 'espacio_id')->toArray();

        // 1. Crear reservas confirmadas (pasadas)
        Reserva::factory()->count(30)->make()->each(function ($reserva) use ($usuarios, $espacios, $escritorios) {
            // Asignar usuario y espacio aleatorios
            $reserva->user_id = $usuarios[array_rand($usuarios)];
            $reserva->espacio_id = $espacios[array_rand($espacios)];
            
            // Fecha pasada (entre 1 y 30 días atrás)
            $diasAtras = rand(1, 30);
            $reserva->fecha_inicio = Carbon::parse($reserva->fecha_inicio)->subDays($diasAtras);
            $reserva->fecha_fin = Carbon::parse($reserva->fecha_fin)->subDays($diasAtras);
            
            // Asignar escritorio para espacios coworking
            $espacio = Espacio::find($reserva->espacio_id);
            if ($espacio && $espacio->tipo === 'coworking' && isset($escritorios[$reserva->espacio_id])) {
                $reserva->escritorio_id = $escritorios[$reserva->espacio_id];
            }
            
            $reserva->estado = 'confirmada';
            $reserva->save();
        });

        // 2. Crear reservas confirmadas (futuras)
        Reserva::factory()->count(20)->make()->each(function ($reserva) use ($usuarios, $espacios, $escritorios) {
            $reserva->user_id = $usuarios[array_rand($usuarios)];
            $reserva->espacio_id = $espacios[array_rand($espacios)];
            
            // Asignar escritorio para espacios coworking
            $espacio = Espacio::find($reserva->espacio_id);
            if ($espacio && $espacio->tipo === 'coworking' && isset($escritorios[$reserva->espacio_id])) {
                $reserva->escritorio_id = $escritorios[$reserva->espacio_id];
            }
            
            $reserva->estado = 'confirmada';
            $reserva->save();
        });

        // 3. Crear reservas pendientes
        Reserva::factory()->count(10)->make()->each(function ($reserva) use ($usuarios, $espacios, $escritorios) {
            $reserva->user_id = $usuarios[array_rand($usuarios)];
            $reserva->espacio_id = $espacios[array_rand($espacios)];
            
            // Asignar escritorio para espacios coworking
            $espacio = Espacio::find($reserva->espacio_id);
            if ($espacio && $espacio->tipo === 'coworking' && isset($escritorios[$reserva->espacio_id])) {
                $reserva->escritorio_id = $escritorios[$reserva->espacio_id];
            }
            
            $reserva->estado = 'pendiente';
            $reserva->save();
        });

        // 4. Crear reservas canceladas
        Reserva::factory()->count(5)->make()->each(function ($reserva) use ($usuarios, $espacios, $escritorios) {
            $reserva->user_id = $usuarios[array_rand($usuarios)];
            $reserva->espacio_id = $espacios[array_rand($espacios)];
            
            // Asignar escritorio para espacios coworking
            $espacio = Espacio::find($reserva->espacio_id);
            if ($espacio && $espacio->tipo === 'coworking' && isset($escritorios[$reserva->espacio_id])) {
                $reserva->escritorio_id = $escritorios[$reserva->espacio_id];
            }
            
            $reserva->estado = 'cancelada';
            $reserva->save();
        });
    }
}