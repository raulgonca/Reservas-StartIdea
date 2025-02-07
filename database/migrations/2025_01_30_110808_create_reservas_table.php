<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReservasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::create('reservas', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('espacio_id')->constrained('espacios')->onDelete('cascade');
        $table->foreignId('escritorio_id')->nullable()->constrained('escritorios')->onDelete('cascade');
        $table->dateTime('fecha_inicio'); // Cambiado a dateTime
        $table->dateTime('fecha_fin')->nullable(); // Cambiado a dateTime
        $table->enum('tipo_reserva', ['hora', 'medio_dia', 'dia_completo', 'semana', 'mes']);
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
        Schema::dropIfExists('reservas');
    }
}