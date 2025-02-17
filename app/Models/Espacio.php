<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Espacio extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'features',
        'capacity',
        'price',
        'is_active'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2'
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function escritorios()
    {
        return $this->hasMany(Escritorio::class);
    }

    // Accessor para la URL de la imagen
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}