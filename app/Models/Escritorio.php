<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// app/Models/Escritorio.php
class Escritorio extends Model
{
    protected $fillable = [
        'espacio_id',
        'numero',
        'is_active'
    ];

    public function espacio()
    {
        return $this->belongsTo(Espacio::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}