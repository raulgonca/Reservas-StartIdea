<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuarios predeterminados primero
        $this->call([
            UserSeeder::class,        // Primero usuarios porque otras tablas dependen de ellos
            EspacioSeeder::class,     // Segundo espacios porque escritorios dependen de ellos
            EscritorioSeeder::class,  // Tercero escritorios
            ReservaSeeder::class,     // Cuarto reservas porque dependen de todo lo anterior
        ]);
    }
}