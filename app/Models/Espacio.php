<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Espacio extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'tipo',
        'aforo',
        'horario_inicio',
        'horario_fin',
        'disponible_24_7',
        'descripcion',
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function escritorios()
    {
        return $this->hasMany(Escritorio::class);
    }
}