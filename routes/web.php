<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\EspacioController;
use App\Http\Controllers\EscritorioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\BloqueoController;
use App\Http\Controllers\ReservaRecurrenteController;
use App\Http\Controllers\SuperAdminRegisterController;

// Ruta para la página de bienvenida
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Ruta para el dashboard, protegida por middleware de autenticación y verificación
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Prefijo de versión para las rutas de autenticación
Route::prefix('v1')->middleware('auth')->group(function () {
    // Ruta para editar el perfil del usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Ruta para actualizar el perfil del usuario
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Ruta para eliminar el perfil del usuario
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Prefijo de versión para las rutas del superadministrador
Route::prefix('v1')->middleware(['auth', 'superadmin'])->group(function () {
    // Ruta para mostrar el formulario de creación de usuarios
    Route::get('/admin/users/create', [SuperAdminRegisterController::class, 'create'])->name('admin.users.create');
    // Ruta para manejar la creación de usuarios
    Route::post('/admin/users', [SuperAdminRegisterController::class, 'store'])->name('admin.users.store');
    // Ruta para mostrar el formulario de edición de usuarios
    Route::get('/admin/users/{id}/edit', [SuperAdminRegisterController::class, 'edit'])->name('admin.users.edit');
    // Ruta para manejar la actualización de usuarios
    Route::patch('/admin/users/{id}', [SuperAdminRegisterController::class, 'update'])->name('admin.users.update');
    // Ruta para manejar la eliminación de usuarios
    Route::delete('/admin/users/{id}', [SuperAdminRegisterController::class, 'destroy'])->name('admin.users.destroy');
});

// Prefijo de versión para las rutas de espacios
Route::prefix('v1')->group(function () {
    // Rutas para mostrar y listar los espacios
    Route::get('/espacios', [EspacioController::class, 'index'])->name('espacios.index');
    Route::get('/espacios/{id}', [EspacioController::class, 'show'])->name('espacios.show');
});

// Prefijo de versión para las rutas de escritorios
Route::prefix('v1')->group(function () {
    // Rutas para mostrar y listar los escritorios
    Route::get('/escritorios', [EscritorioController::class, 'index'])->name('escritorios.index');
    Route::get('/escritorios/{id}', [EscritorioController::class, 'show'])->name('escritorios.show');
});

// Prefijo de versión para las rutas de reservas
Route::prefix('v1')->group(function () {
    // Rutas para mostrar y listar las reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('reservas.index');
    Route::get('/reservas/{id}', [ReservaController::class, 'show'])->name('reservas.show');

    // Rutas para crear y almacenar reservas, protegidas por middleware de usuario
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('reservas.create')->middleware('user');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('reservas.store')->middleware('user');
});

// Prefijo de versión para las rutas de bloqueos
Route::prefix('v1')->middleware('admin')->group(function () {
    // Rutas para mostrar y listar los bloqueos
    Route::get('/bloqueos', [BloqueoController::class, 'index'])->name('bloqueos.index');
    Route::get('/bloqueos/{id}', [BloqueoController::class, 'show'])->name('bloqueos.show');

    // Rutas para crear y almacenar bloqueos
    Route::get('/bloqueos/create', [BloqueoController::class, 'create'])->name('bloqueos.create');
    Route::post('/bloqueos', [BloqueoController::class, 'store'])->name('bloqueos.store');
});

// Prefijo de versión para las rutas de reservas recurrentes
Route::prefix('v1')->middleware('admin')->group(function () {
    // Rutas para mostrar y listar las reservas recurrentes
    Route::get('/reservas_recurrentes', [ReservaRecurrenteController::class, 'index'])->name('reservas_recurrentes.index');
    Route::get('/reservas_recurrentes/{id}', [ReservaRecurrenteController::class, 'show'])->name('reservas_recurrentes.show');

    // Rutas para crear y almacenar reservas recurrentes
    Route::get('/reservas_recurrentes/create', [ReservaRecurrenteController::class, 'create'])->name('reservas_recurrentes.create');
    Route::post('/reservas_recurrentes', [ReservaRecurrenteController::class, 'store'])->name('reservas_recurrentes.store');
});

// Incluir las rutas de autenticación
require __DIR__.'/auth.php';