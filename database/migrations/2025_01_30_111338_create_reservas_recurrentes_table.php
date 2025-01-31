<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReservasRecurrentesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reservas_recurrentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('espacio_id')->constrained('espacios')->onDelete('cascade');
            $table->foreignId('escritorio_id')->nullable()->constrained('escritorios')->onDelete('cascade');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->enum('tipo_reserva', ['hora', 'medio_dia', 'dia_completo', 'semana', 'mes']);
            $table->enum('frecuencia', ['diaria', 'semanal', 'mensual']);
            $table->string('dias_semana')->nullable();
            $table->enum('estado', ['confirmada', 'pendiente', 'cancelada'])->default('pendiente');
            $table->text('motivo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reservas_recurrentes');
    }
}