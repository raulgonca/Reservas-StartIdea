<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Reserva extends Model
{
    protected $fillable = [
        'user_id',
        'espacio_id',
        'escritorio_id',
        'fecha_inicio',
        'fecha_fin',
        'tipo_reserva',
        'estado',
        'motivo',
    ];

    protected $dates = [
        'fecha_inicio',
        'fecha_fin',
    ];

    public function getFechaInicioAttribute($value)
    {
        return Carbon::parse($value);
    }

    public function getFechaFinAttribute($value)
    {
        return Carbon::parse($value);
    }
}