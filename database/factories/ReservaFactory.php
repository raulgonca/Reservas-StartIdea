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
     * Obtiene la hora de inicio desde la configuración centralizada
     * @return string
     */
    protected function getHoraInicio(): string
    {
        return config('reservas.horarios.hora_inicio', '08:00');
    }

    /**
     * Obtiene la hora de fin desde la configuración centralizada
     * @return string
     */
    protected function getHoraFin(): string
    {
        return config('reservas.horarios.hora_fin', '22:00');
    }

    /**
     * Obtiene los horarios de medio día desde la configuración centralizada
     * @return array
     */
    protected function getHorariosMedioDia(): array
    {
        return config('reservas.horarios.medio_dia', [
            'mañana' => ['inicio' => '08:00', 'fin' => '14:00'],
            'tarde' => ['inicio' => '14:00', 'fin' => '20:00']
        ]);
    }

    /**
     * Obtiene el horario de día completo desde la configuración centralizada
     * @return array
     */
    protected function getHorarioDiaCompleto(): array
    {
        return config('reservas.horarios.dia_completo', [
            'inicio' => '00:00',
            'fin' => '23:59'
        ]);
    }

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
        
        // Obtener rangos de horas de la configuración
        $horaInicioConfig = $this->getHoraInicio();
        $horaFinConfig = $this->getHoraFin();
        $horaInicioInt = (int)explode(':', $horaInicioConfig)[0];
        $horaFinInt = (int)explode(':', $horaFinConfig)[0];

        // Configurar fechas y horas según el tipo de reserva
        switch ($tipoReserva) {
            case 'hora':
                // Para reservas por hora, añadir entre 1 y 4 horas
                // Usar el rango de horas de la configuración
                $horaInicio = $this->faker->numberBetween($horaInicioInt, $horaFinInt - 1);
                $fechaInicio->setTime($horaInicio, 0, 0);
                $fechaFin->setTime($horaInicio + $this->faker->numberBetween(1, min(4, $horaFinInt - $horaInicio)), 0, 0);
                break;

            case 'medio_dia':
                // Usar los valores de medio día de la configuración
                $horariosMedioDia = $this->getHorariosMedioDia();
                $esManana = $this->faker->boolean();
                $periodo = $esManana ? 'mañana' : 'tarde';
                
                if (isset($horariosMedioDia[$periodo])) {
                    $inicioHora = (int)explode(':', $horariosMedioDia[$periodo]['inicio'])[0];
                    $inicioMinuto = (int)explode(':', $horariosMedioDia[$periodo]['inicio'])[1];
                    $finHora = (int)explode(':', $horariosMedioDia[$periodo]['fin'])[0];
                    $finMinuto = (int)explode(':', $horariosMedioDia[$periodo]['fin'])[1];
                    
                    $fechaInicio->setTime($inicioHora, $inicioMinuto, 0);
                    $fechaFin->setTime($finHora, $finMinuto, 0);
                } else {
                    // Fallback si no se encuentra la configuración
                    $fechaInicio->setTime($esManana ? 8 : 14, 0, 0);
                    $fechaFin->setTime($esManana ? 14 : 20, 0, 0);
                }
                break;

            case 'dia_completo':
                // Usar configuración de día completo
                $horarioDiaCompleto = $this->getHorarioDiaCompleto();
                $inicioHora = (int)explode(':', $horarioDiaCompleto['inicio'])[0];
                $inicioMinuto = (int)explode(':', $horarioDiaCompleto['inicio'])[1];
                $finHora = (int)explode(':', $horarioDiaCompleto['fin'])[0];
                $finMinuto = (int)explode(':', $horarioDiaCompleto['fin'])[1];
                
                $fechaInicio->setTime($inicioHora, $inicioMinuto, 0);
                $fechaFin->setTime($finHora, $finMinuto, 59);
                break;

            case 'semana':
                // Configurar semana completa usando horario de día completo
                $horarioDiaCompleto = $this->getHorarioDiaCompleto();
                $inicioHora = (int)explode(':', $horarioDiaCompleto['inicio'])[0];
                $inicioMinuto = (int)explode(':', $horarioDiaCompleto['inicio'])[1];
                $finHora = (int)explode(':', $horarioDiaCompleto['fin'])[0];
                $finMinuto = (int)explode(':', $horarioDiaCompleto['fin'])[1];
                
                $fechaInicio->setTime($inicioHora, $inicioMinuto, 0);
                $fechaFin = $fechaInicio->copy()->addDays(6);
                $fechaFin->setTime($finHora, $finMinuto, 59);
                break;

            case 'mes':
                // Configurar mes completo usando horario de día completo
                $horarioDiaCompleto = $this->getHorarioDiaCompleto();
                $inicioHora = (int)explode(':', $horarioDiaCompleto['inicio'])[0];
                $inicioMinuto = (int)explode(':', $horarioDiaCompleto['inicio'])[1];
                $finHora = (int)explode(':', $horarioDiaCompleto['fin'])[0];
                $finMinuto = (int)explode(':', $horarioDiaCompleto['fin'])[1];
                
                $fechaInicio->setTime($inicioHora, $inicioMinuto, 0);
                $fechaFin = $fechaInicio->copy()->addMonth()->subDay();
                $fechaFin->setTime($finHora, $finMinuto, 59);
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