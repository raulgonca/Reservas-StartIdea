<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;


class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'espacio_id',
        'escritorio_id',
        'fecha_inicio',
        'fecha_fin',
        'tipo_reserva',
        'estado',
        'motivo'
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

    // Definir la relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Definir la relación con el modelo Espacio
    // Asegúrate de que tengas estas relaciones
    public function espacio()
    {
        return $this->belongsTo(Espacio::class, 'espacio_id');
    }

    public function escritorio()
    {
        return $this->belongsTo(Escritorio::class, 'escritorio_id');
    }
}
