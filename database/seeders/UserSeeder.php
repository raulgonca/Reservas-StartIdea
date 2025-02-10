<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generar 50 usuarios utilizando la fábrica de usuarios
        User::factory()->count(50)->create();
    }
}