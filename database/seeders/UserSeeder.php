<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@superadmin.com',
            'password' => Hash::make('password'),
            'phone' => '666666666',
            'dni' => '12345678A',
            'role' => 'superadmin',
        ]);

        // Usuario Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'phone' => '677777777',
            'dni' => '87654321B',
            'role' => 'admin',
        ]);

        // Usuario normal
        User::create([
            'name' => 'User',
            'email' => 'user@user.com',
            'password' => Hash::make('password'),
            'phone' => '688888888',
            'dni' => '11111111C',
            'role' => 'user',
        ]);

        // Crear algunos usuarios aleatorios adicionales
        User::factory()->count(50)->create();
    }
}