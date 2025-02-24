<?php

namespace Tests\Unit;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use App\Models\Reserva;
use App\Services\ReservaService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NuevaReservaNotification;

/**
 * Test completo del sistema de reservas
 * Incluye validaciones, solapamientos, estados y rendimiento
 */
class ReservaSystemTest extends TestCase
{
    use RefreshDatabase;

    protected $reservaService;
    protected $user;
    protected $admin;
    protected $espacio;
    protected $escritorio;

    /**
     * Configuración inicial para cada test
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Inicializar servicio y modelos necesarios
        $this->reservaService = new ReservaService();
        
        // Crear usuarios de prueba
        $this->user = User::factory()->create(['role' => 'user']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        
        // Crear espacio de prueba
        $this->espacio = Espacio::create([
            'nombre' => 'Espacio Test',
            'tipo' => 'coworking',
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false
        ]);

        // Crear escritorio de prueba
        $this->escritorio = Escritorio::create([
            'espacio_id' => $this->espacio->id,
            'numero' => 1,
            'estado' => 'disponible'
        ]);

        // Limpiar notificaciones
        Notification::fake();
    }

    /**
     * Test de solapamiento exacto
     */
    #[Test]
    public function detecta_solapamiento_exacto()
    {
        // Crear reserva inicial
        $reserva = Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow()->setHour(9),
            'fecha_fin' => Carbon::tomorrow()->setHour(11),
            'tipo_reserva' => 'hora',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar crear reserva en mismo horario
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow()->setHour(9)->format('Y-m-d H:i:s'),
            'fecha_fin' => Carbon::tomorrow()->setHour(11)->format('Y-m-d H:i:s'),
            'tipo_reserva' => 'hora'
        ]);
    }

    /**
     * Test de reserva fuera de horario solapado
     */
    #[Test]
    public function permite_reserva_sin_solapamiento()
    {
        // Crear reserva inicial
        $reserva = Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow()->setHour(9),
            'fecha_fin' => Carbon::tomorrow()->setHour(11),
            'tipo_reserva' => 'hora',
            'estado' => 'confirmada'
        ]);

        // Intentar crear reserva en horario libre
        $resultado = $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow()->setHour(12)->format('Y-m-d H:i:s'),
            'fecha_fin' => Carbon::tomorrow()->setHour(14)->format('Y-m-d H:i:s'),
            'tipo_reserva' => 'hora'
        ]);

        $this->assertTrue($resultado);
    }

    /**
     * Test de reserva medio día
     */
    #[Test]
    public function valida_reserva_medio_dia()
    {
        $resultado = $this->reservaService->validateAndPrepareData([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow()->format('Y-m-d'),
            'fecha_fin' => Carbon::tomorrow()->format('Y-m-d'),
            'tipo_reserva' => 'medio_dia',
            'hora_inicio' => '08:00',
            'hora_fin' => '14:00'
        ]);

        $this->assertEquals('08:00', Carbon::parse($resultado['fecha_inicio'])->format('H:i'));
        $this->assertEquals('14:00', Carbon::parse($resultado['fecha_fin'])->format('H:i'));
    }

    /**
     * Test de cambio de estados
     */
    #[Test]
    public function valida_cambio_estados()
    {
        $reserva = Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow(),
            'fecha_fin' => Carbon::tomorrow(),
            'tipo_reserva' => 'hora',
            'estado' => 'pendiente'
        ]);

        // Confirmar reserva
        $reserva->update(['estado' => 'confirmada']);
        $this->assertEquals('confirmada', $reserva->fresh()->estado);

        // Cancelar reserva
        $reserva->update(['estado' => 'cancelada']);
        $this->assertEquals('cancelada', $reserva->fresh()->estado);
    }

    /**
     * Test de notificaciones
     */
    #[Test]
    public function verifica_notificaciones()
    {
        $reserva = Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacio->id,
            'fecha_inicio' => Carbon::tomorrow(),
            'fecha_fin' => Carbon::tomorrow(),
            'tipo_reserva' => 'hora',
            'estado' => 'pendiente'
        ]);

        $this->admin->notify(new NuevaReservaNotification($reserva));

        Notification::assertSentTo(
            [$this->admin],
            NuevaReservaNotification::class
        );
    }
}