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
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fechaInicio = Carbon::instance($this->faker->dateTimeBetween('now', '+2 months'));
        $tipoReserva = $this->faker->randomElement(['hora', 'medio_dia', 'dia_completo', 'semana', 'mes']);
        $fechaFin = clone $fechaInicio;

        // Configurar fechas y horas según el tipo de reserva
        switch ($tipoReserva) {
            case 'hora':
                // Para reservas por hora, añadir entre 1 y 4 horas
                $horaInicio = $this->faker->numberBetween(8, 20); // Entre 8 AM y 8 PM
                $fechaInicio->setTime($horaInicio, 0, 0);
                $fechaFin->setTime($horaInicio + $this->faker->numberBetween(1, 4), 0, 0);
                break;

            case 'medio_dia':
                // Solo permitir 8:00 o 14:00 para medio día
                $esManana = $this->faker->boolean();
                $fechaInicio->setTime($esManana ? 8 : 14, 0, 0);
                $fechaFin->setTime($esManana ? 13 : 23, 59, 59);
                break;

            case 'dia_completo':
                // Configurar día completo (00:00 - 23:59)
                $fechaInicio->startOfDay();
                $fechaFin->endOfDay();
                break;

            case 'semana':
                // Configurar semana completa
                $fechaInicio->startOfDay();
                $fechaFin = $fechaInicio->copy()->addDays(6)->endOfDay();
                break;

            case 'mes':
                // Configurar mes completo
                $fechaInicio->startOfDay();
                $fechaFin = $fechaInicio->copy()->endOfMonth()->endOfDay();
                break;
        }

        return [
            'user_id' => null,        // Será asignado en el seeder
            'espacio_id' => null,     // Será asignado en el seeder
            'escritorio_id' => null,  // Será asignado en el seeder
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'tipo_reserva' => $tipoReserva,
            'motivo' => $this->faker->sentence(),
            'estado' => 'pendiente',  // Será asignado en el seeder
        ];
    }
}