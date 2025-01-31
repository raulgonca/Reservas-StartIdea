<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Escritorio extends Model
{
    use HasFactory;

    protected $fillable = [
        'espacio_id',
        'nombre',
        'disponible',
    ];

    public function espacio()
    {
        return $this->belongsTo(Espacio::class);
    }
}