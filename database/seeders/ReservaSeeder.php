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

        // Generar 20 reservas para cada tipo
        foreach (['hora', 'medio_dia', 'dia_completo', 'semana', 'mes'] as $tipo) {
            Reserva::factory()
                ->count(20)
                ->state(function () use ($tipo) {
                    return ['tipo_reserva' => $tipo];
                })
                ->make()
                ->each(function ($reserva) use ($users, $espacios, $escritorios) {
                    // Asignar relaciones aleatorias
                    $reserva->user_id = $users->random()->id;
                    $reserva->espacio_id = $espacios->random()->id;
                    
                    // Asignar escritorio solo si el espacio tiene escritorios
                    $escritoriosEspacio = $escritorios->where('espacio_id', $reserva->espacio_id);
                    $reserva->escritorio_id = $escritoriosEspacio->isNotEmpty() 
                        ? $escritoriosEspacio->random()->id 
                        : null;

                    // Asignar estado aleatorio
                    $reserva->estado = collect(['confirmada', 'pendiente', 'cancelada'])->random();
                    
                    $reserva->save();
                });
        }
    }
}