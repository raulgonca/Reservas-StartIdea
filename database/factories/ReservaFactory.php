<?php

namespace Database\Factories;

use App\Models\Reserva;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ReservaFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Reserva::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $fechaInicio = Carbon::instance($this->faker->dateTimeBetween('-1 month', '+1 month'));
        $tipoReserva = $this->faker->randomElement(['hora', 'medio_dia', 'dia_completo', 'semana', 'mes']);
        $fechaFin = clone $fechaInicio;

        switch ($tipoReserva) {
            case 'hora':
                $fechaFin->addHour();
                break;
            case 'medio_dia':
                $fechaFin->addHours(6);
                break;
            case 'dia_completo':
                $fechaFin->endOfDay();
                break;
            case 'semana':
                $fechaFin->addWeek();
                break;
            case 'mes':
                $fechaFin->endOfMonth();
                break;
        }

        return [
            'user_id' => null, // Será asignado en el seeder
            'espacio_id' => null, // Será asignado en el seeder
            'escritorio_id' => null, // Será asignado en el seeder
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'tipo_reserva' => $tipoReserva,
            'motivo' => $this->faker->sentence(),
            'estado' => 'pendiente', // Será asignado en el seeder
        ];
    }
}