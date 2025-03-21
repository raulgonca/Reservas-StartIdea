<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Bloqueo extends Model
{
    use HasFactory;

    protected $fillable = [
        'espacio_id',
        'escritorio_id',
        'fecha_inicio',
        'fecha_fin',
        'motivo',
        'creado_por'
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

    public function espacio()
    {
        return $this->belongsTo(Espacio::class);
    }

    // Relación con el modelo Escritorio (opcional si el bloqueo es para un escritorio específico)
    public function escritorio()
    {
        return $this->belongsTo(Escritorio::class);
    }

    // Relación con el usuario que creó el bloqueo
    public function creadoPor()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }
}