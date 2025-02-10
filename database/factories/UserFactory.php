<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => bcrypt('password'), // Contraseña por defecto
            'phone' => $this->faker->regexify('[6789]\d{8}'), // Teléfono en formato español
            'dni' => $this->faker->regexify('\d{8}[A-Za-z]'), // DNI en formato español
            'role' => 'user', // Rol por defecto
            'remember_token' => Str::random(10),
        ];
    }
}