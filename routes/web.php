<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use App\Models\Espacio;

use App\Http\Controllers\EspacioController;
use App\Http\Controllers\EscritorioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\BloqueoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservaRecurrenteController;
use App\Http\Controllers\UserController; // Cambiado de SuperAdminRegisterController a UserController

// Ruta para la página de bienvenida
Route::get('/', [EspacioController::class, 'index']);

// Ruta para el dashboard, protegida por middleware de autenticación y verificación
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats'])
        ->middleware(['auth', 'verified']);
});

//------------------------------- USUARIOS ----------------------------------//
Route::prefix('v1/user')->middleware(['auth'])->group(function () {
    // Ruta del calendario (debe ir antes de las rutas con parámetros)
    Route::get('/reservas/calendario', [ReservaController::class, 'calendario'])
        ->name('user.reservas.calendario');

    // Rutas existentes
    Route::get('/reservas', [ReservaController::class, 'index'])->name('user.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('user.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('user.reservas.store');
    Route::get('/reservas/{id}', [ReservaController::class, 'show'])->name('user.reservas.show');
});

//------------------------------- PERFIL DE USUARIO ----------------------------------//
Route::prefix('v1')->middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//------------------------------- ADMINISTRADOR ----------------------------------//
Route::prefix('v1/admin')->middleware(['auth'])->group(function () {
    // Rutas para gestionar usuarios (NUEVAS)
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
    Route::patch('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // Rutas para gestionar reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('admin.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('admin.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('admin.reservas.store');
    Route::get('/reservas/{id}/edit', [ReservaController::class, 'edit'])->name('admin.reservas.edit');
    Route::patch('/reservas/{id}', [ReservaController::class, 'update'])->name('admin.reservas.update');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('admin.reservas.destroy');

    // Rutas para gestionar espacios - Índice (solo requiere autenticación)
    Route::get('/espacios', [EspacioController::class, 'index'])->name('admin.espacios.index');

    // Rutas para gestionar espacios - Operaciones que requieren permiso específico
    Route::get('/espacios/create', [EspacioController::class, 'create'])->name('admin.espacios.create');
    Route::post('/espacios', [EspacioController::class, 'store'])->name('admin.espacios.store');
    Route::get('/espacios/{id}/edit', [EspacioController::class, 'edit'])->name('admin.espacios.edit');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->name('admin.espacios.update');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->name('admin.espacios.destroy');
    Route::patch('/espacios/{id}/toggle-active', [EspacioController::class, 'toggleActive'])->name('admin.espacios.toggle-active');

    // Rutas para gestionar bloqueos
    Route::get('/bloqueos', [BloqueoController::class, 'index'])->name('admin.bloqueos.index');
    Route::get('/bloqueos/create', [BloqueoController::class, 'create'])->name('admin.bloqueos.create');
    Route::post('/bloqueos', [BloqueoController::class, 'store'])->name('admin.bloqueos.store');
    Route::get('/bloqueos/{bloqueo}/edit', [BloqueoController::class, 'edit'])->name('admin.bloqueos.edit');
    Route::put('/bloqueos/{bloqueo}', [BloqueoController::class, 'update'])->name('admin.bloqueos.update');
    Route::delete('/bloqueos/{bloqueo}', [BloqueoController::class, 'destroy'])->name('admin.bloqueos.destroy');
});

//------------------------------- SUPERADMIN ----------------------------------//
Route::prefix('v1/superadmin')->middleware(['auth'])->group(function () {
    // Gestión de usuarios - Actualizado para usar UserController
    Route::get('/users/create', [UserController::class, 'create'])->name('superadmin.users.create');
    Route::post('/users', [UserController::class, 'store'])->name('superadmin.users.store');
    Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('superadmin.users.edit');
    Route::patch('/users/{id}', [UserController::class, 'update'])->name('superadmin.users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('superadmin.users.destroy');
    Route::get('/users', [UserController::class, 'index'])->name('superadmin.users.index');

    // Gestión de reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('superadmin.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('superadmin.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('superadmin.reservas.store');
    Route::get('/reservas/{id}/edit', [ReservaController::class, 'edit'])->name('superadmin.reservas.edit');
    Route::patch('/reservas/{id}', [ReservaController::class, 'update'])->name('superadmin.reservas.update');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('superadmin.reservas.destroy');

    // Gestión de espacios - Índice (solo requiere autenticación)
    Route::get('/espacios', [EspacioController::class, 'index'])->name('superadmin.espacios.index');

    // Rutas para gestionar espacios - Operaciones que requieren permiso específico
    Route::get('/espacios/create', [EspacioController::class, 'create'])->name('superadmin.espacios.create');
    Route::post('/espacios', [EspacioController::class, 'store'])->name('superadmin.espacios.store');
    Route::get('/espacios/{id}/edit', [EspacioController::class, 'edit'])->name('superadmin.espacios.edit');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->name('superadmin.espacios.update');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->name('superadmin.espacios.destroy');
    Route::patch('/espacios/{id}/toggle-active', [EspacioController::class, 'toggleActive'])->name('superadmin.espacios.toggle-active');

    // Rutas para gestionar bloqueos
    Route::get('/bloqueos', [BloqueoController::class, 'index'])->name('superadmin.bloqueos.index');
    Route::get('/bloqueos/create', [BloqueoController::class, 'create'])->name('superadmin.bloqueos.create');
    Route::post('/bloqueos', [BloqueoController::class, 'store'])->name('superadmin.bloqueos.store');
    Route::get('/bloqueos/{bloqueo}/edit', [BloqueoController::class, 'edit'])->name('superadmin.bloqueos.edit');
    Route::put('/bloqueos/{bloqueo}', [BloqueoController::class, 'update'])->name('superadmin.bloqueos.update');
    Route::delete('/bloqueos/{bloqueo}', [BloqueoController::class, 'destroy'])->name('superadmin.bloqueos.destroy');
});

//------------------------------- ESPACIOS PÚBLICOS ----------------------------------//
Route::prefix('v1')->group(function () {
    Route::get('/espacios', [EspacioController::class, 'index'])->name('espacios.index');
    Route::get('/espacios/{slug}', [EspacioController::class, 'show'])->name('espacios.show');
    Route::get('/espacios/{id}/availability', [EspacioController::class, 'getAvailability']);
    Route::get('/espacios/{id}/escritorios/availability', [EspacioController::class, 'getDesksAvailability']);
});

//------------------------------- ESCRITORIOS ----------------------------------//
Route::prefix('v1')->group(function () {
    Route::get('/escritorios', [EscritorioController::class, 'index'])->name('escritorios.index');
    Route::get('/escritorios/{id}', [EscritorioController::class, 'show'])->name('escritorios.show');
});

require __DIR__ . '/auth.php';
