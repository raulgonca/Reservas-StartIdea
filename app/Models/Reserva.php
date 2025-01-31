<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'espacio_id',
        'escritorio_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'tipo_reserva',
        'estado',
        'motivo',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function espacio()
    {
        return $this->belongsTo(Espacio::class);
    }

    public function escritorio()
    {
        return $this->belongsTo(Escritorio::class);
    }
}