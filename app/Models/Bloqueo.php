<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bloqueo extends Model
{
    use HasFactory;

    protected $fillable = [
        'espacio_id',
        'escritorio_id',
        'fecha_inicio',
        'fecha_fin',
        'hora_inicio',
        'hora_fin',
        'motivo',
    ];

    public function espacio()
    {
        return $this->belongsTo(Espacio::class);
    }

    public function escritorio()
    {
        return $this->belongsTo(Escritorio::class);
    }
}