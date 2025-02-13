<?php

namespace Tests\Unit;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use App\Models\User;
use App\Models\Espacio;
use App\Models\Escritorio;
use App\Models\Reserva;
use App\Services\ReservaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

/**
 * Clase de pruebas para validar solapamientos en reservas
 * Verifica diferentes escenarios de reservas en distintos tipos de espacios
 */
class ReservaSolapamientoTest extends TestCase
{
    use RefreshDatabase; // Refresca la base de datos entre pruebas

    protected $reservaService;
    protected $user;
    protected $espacioCoworking;
    protected $espacioDespacho;
    protected $espacioSala;
    protected $escritorio;

    /**
     * Configuración inicial para cada prueba
     * Crea los datos necesarios: usuario, espacios y escritorio
     */
    public function setUp(): void
    {
        parent::setUp();
        
        // Crear instancia del servicio de reservas
        $this->reservaService = new ReservaService();
        
        // Crear usuario de prueba
        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'user'
        ]);
        
        // Crear espacio de coworking
        $this->espacioCoworking = Espacio::create([
            'nombre' => 'Test Coworking',
            'tipo' => 'coworking',
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false
        ]);
        
        // Crear espacio de despacho
        $this->espacioDespacho = Espacio::create([
            'nombre' => 'Test Despacho',
            'tipo' => 'despacho',
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false
        ]);

        // Crear espacio de sala de reuniones
        $this->espacioSala = Espacio::create([
            'nombre' => 'Test Sala',
            'tipo' => 'sala',
            'horario_inicio' => '08:00:00',
            'horario_fin' => '18:00:00',
            'disponible_24_7' => false
        ]);
        
        // Crear escritorio en espacio coworking
        $this->escritorio = Escritorio::create([
            'nombre' => 'Escritorio Test',
            'espacio_id' => $this->espacioCoworking->id
        ]);
    }

    /**
     * Test que verifica solapamiento en escritorio de coworking
     * Debe detectar cuando se intenta reservar un escritorio ya reservado
     * en un horario que se solapa
     */
    #[Test]
    public function detecta_solapamiento_coworking_mismo_escritorio()
    {
        // Crear reserva inicial de 09:00 a 14:00
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioCoworking->id,
            'escritorio_id' => $this->escritorio->id,
            'fecha_inicio' => '2025-02-12 09:00:00',
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar el mismo escritorio de 13:00 a 15:00
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioCoworking->id,
            'escritorio_id' => $this->escritorio->id,
            'fecha_inicio' => '2025-02-12 13:00:00',
            'fecha_fin' => '2025-02-12 15:00:00',
            'tipo_reserva' => 'medio_dia'
        ]);
    }

    /**
     * Test que verifica solapamiento en despacho privado
     * Debe detectar cuando se intenta reservar un despacho ya reservado
     * en un horario que se solapa
     */
    #[Test]
    public function detecta_solapamiento_despacho()
    {
        // Crear reserva inicial de 09:00 a 14:00
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 09:00:00',
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar el mismo despacho de 13:00 a 15:00
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 13:00:00',
            'fecha_fin' => '2025-02-12 15:00:00',
            'tipo_reserva' => 'medio_dia'
        ]);
    }

    /**
     * Test que verifica solapamiento en sala de reuniones
     * Debe detectar cuando se intenta reservar una sala ya reservada
     * en un horario que se solapa
     */
    #[Test]
    public function detecta_solapamiento_sala()
    {
        // Crear reserva inicial de 10:00 a 11:00
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioSala->id,
            'fecha_inicio' => '2025-02-12 10:00:00',
            'fecha_fin' => '2025-02-12 11:00:00',
            'tipo_reserva' => 'hora',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar la misma sala de 10:30 a 11:30
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioSala->id,
            'fecha_inicio' => '2025-02-12 10:30:00',
            'fecha_fin' => '2025-02-12 11:30:00',
            'tipo_reserva' => 'hora'
        ]);
    }

    /**
     * Test que verifica solapamiento con reserva de día completo
     * Debe detectar cuando se intenta reservar un espacio que ya está
     * reservado para todo el día
     */
    #[Test]
    public function detecta_solapamiento_dia_completo()
    {
        // Crear reserva de día completo
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 00:00:00',
            'fecha_fin' => '2025-02-12 23:59:59',
            'tipo_reserva' => 'dia_completo',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar dentro del mismo día
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 14:00:00',
            'fecha_fin' => '2025-02-12 15:00:00',
            'tipo_reserva' => 'hora'
        ]);
    }

    /**
     * Test que verifica solapamiento con reserva semanal
     * Debe detectar cuando se intenta reservar un espacio que ya está
     * reservado para toda la semana
     */
    #[Test]
    public function detecta_solapamiento_reserva_semanal()
    {
        // Crear reserva semanal
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-10 00:00:00', // Lunes
            'fecha_fin' => '2025-02-16 23:59:59',    // Domingo
            'tipo_reserva' => 'semana',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar dentro de la misma semana
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 09:00:00', // Miércoles
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia'
        ]);
    }

    /**
     * Test que verifica solapamiento con reserva mensual
     * Debe detectar cuando se intenta reservar un espacio que ya está
     * reservado para todo el mes
     */
    #[Test]
    public function detecta_solapamiento_reserva_mensual()
    {
        // Crear reserva mensual
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-01 00:00:00',
            'fecha_fin' => '2025-02-28 23:59:59',
            'tipo_reserva' => 'mes',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar dentro del mismo mes
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-15 09:00:00',
            'fecha_fin' => '2025-02-15 18:00:00',
            'tipo_reserva' => 'dia_completo'
        ]);
    }

    /**
     * Test que verifica que se permiten reservas en diferentes días
     * No debe haber conflicto entre reservas en días distintos
     */
    #[Test]
    public function permite_reservas_en_diferentes_dias()
    {
        // Crear reserva para un día
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 09:00:00',
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia',
            'estado' => 'confirmada'
        ]);

        // Intentar reservar al día siguiente (debe permitirse)
        $result = $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-13 09:00:00',
            'fecha_fin' => '2025-02-13 14:00:00',
            'tipo_reserva' => 'medio_dia'
        ]);

        $this->assertNull($result);
    }

    /**
     * Test que verifica que se ignoran las reservas canceladas
     * Debe permitir reservar en el mismo horario de una reserva cancelada
     */
    #[Test]
    public function ignora_reservas_canceladas()
    {
        // Crear reserva cancelada
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 09:00:00',
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia',
            'estado' => 'cancelada'
        ]);

        // Intentar reservar en el mismo horario (debe permitirse)
        $result = $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 09:00:00',
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia'
        ]);

        $this->assertNull($result);
    }

     /**
     * Test que verifica que se pueden hacer reservas fuera del horario permitido
     * Debe fallar si se intenta reservar fuera del horario del espacio
     */
    #[Test]
    public function detecta_reserva_fuera_de_horario()
    {
        $this->expectException(ValidationException::class);

        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 19:00:00', // Fuera del horario (18:00)
            'fecha_fin' => '2025-02-12 20:00:00',
            'tipo_reserva' => 'hora'
        ]);
    }

    /**
     * Test que verifica múltiples reservas simultáneas del mismo usuario
     * Debe detectar cuando un usuario intenta reservar dos espacios diferentes
     * en el mismo horario
     */
    #[Test]
    public function detecta_reservas_simultaneas_mismo_usuario()
    {
        // Primera reserva
        Reserva::create([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 09:00:00',
            'fecha_fin' => '2025-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia',
            'estado' => 'confirmada'
        ]);

        $this->expectException(ValidationException::class);

        // Intentar reservar otro espacio en el mismo horario
        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioSala->id,
            'fecha_inicio' => '2025-02-12 10:00:00',
            'fecha_fin' => '2025-02-12 11:00:00',
            'tipo_reserva' => 'hora'
        ]);
    }

    /**
     * Test que verifica que no se pueden hacer reservas en fechas pasadas
     */
    #[Test]
    public function detecta_reserva_en_fecha_pasada()
    {
        $this->expectException(ValidationException::class);

        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2023-02-12 09:00:00', // Fecha pasada
            'fecha_fin' => '2023-02-12 14:00:00',
            'tipo_reserva' => 'medio_dia'
        ]);
    }

    /**
     * Test que verifica que la fecha de fin no puede ser anterior a la fecha de inicio
     */
    #[Test]
    public function detecta_fechas_invertidas()
    {
        $this->expectException(ValidationException::class);

        $this->reservaService->checkOverlap([
            'user_id' => $this->user->id,
            'espacio_id' => $this->espacioDespacho->id,
            'fecha_inicio' => '2025-02-12 14:00:00',
            'fecha_fin' => '2025-02-12 09:00:00', // Anterior a fecha_inicio
            'tipo_reserva' => 'medio_dia'
        ]);
    }
}