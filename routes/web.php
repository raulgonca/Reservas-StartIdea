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
use App\Http\Controllers\ReservaRecurrenteController;
use App\Http\Controllers\SuperAdminRegisterController;

// Ruta para la página de bienvenida
Route::get('/', [EspacioController::class, 'index']);

// Ruta para el dashboard, protegida por middleware de autenticación y verificación
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

//------------------------------- USUARIOS ----------------------------------//
Route::prefix('v1/user')->middleware(['auth'])->group(function () {
    // Solo mantener las rutas necesarias para usuario
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
    // Rutas para gestionar reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('admin.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('admin.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('admin.reservas.store');
    Route::get('/reservas/{id}/edit', [ReservaController::class, 'edit'])->name('admin.reservas.edit');
    Route::patch('/reservas/{id}', [ReservaController::class, 'update'])->name('admin.reservas.update');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('admin.reservas.destroy');

    // Rutas para gestionar espacios
    Route::get('/espacios', [EspacioController::class, 'index'])->name('admin.espacios.index');
    Route::get('/espacios/create', [EspacioController::class, 'create'])->name('admin.espacios.create');
    Route::post('/espacios', [EspacioController::class, 'store'])->name('admin.espacios.store');
    Route::get('/espacios/{id}/edit', [EspacioController::class, 'edit'])->name('admin.espacios.edit');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->name('admin.espacios.update');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->name('admin.espacios.destroy');
});

//------------------------------- SUPERADMIN ----------------------------------//
Route::prefix('v1/superadmin')->middleware(['auth'])->group(function () {
    // Gestión de usuarios
    Route::get('/users/create', [SuperAdminRegisterController::class, 'create'])->name('superadmin.users.create');
    Route::post('/users', [SuperAdminRegisterController::class, 'store'])->name('superadmin.users.store');
    Route::get('/users/{id}/edit', [SuperAdminRegisterController::class, 'edit'])->name('superadmin.users.edit');
    Route::patch('/users/{id}', [SuperAdminRegisterController::class, 'update'])->name('superadmin.users.update');
    Route::delete('/users/{id}', [SuperAdminRegisterController::class, 'destroy'])->name('superadmin.users.destroy');
    Route::get('/users', [SuperAdminRegisterController::class, 'index'])->name('superadmin.users.index');

    // Gestión de reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('superadmin.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('superadmin.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('superadmin.reservas.store');
    Route::get('/reservas/{id}/edit', [ReservaController::class, 'edit'])->name('superadmin.reservas.edit');
    Route::patch('/reservas/{id}', [ReservaController::class, 'update'])->name('superadmin.reservas.update');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('superadmin.reservas.destroy');

    // Gestión de espacios
    Route::get('/espacios', [EspacioController::class, 'index'])->name('superadmin.espacios.index');
    Route::get('/espacios/create', [EspacioController::class, 'create'])->name('superadmin.espacios.create');
    Route::post('/espacios', [EspacioController::class, 'store'])->name('superadmin.espacios.store');
    Route::get('/espacios/{id}/edit', [EspacioController::class, 'edit'])->name('superadmin.espacios.edit');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->name('superadmin.espacios.update');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->name('superadmin.espacios.destroy');
});

//------------------------------- ESPACIOS PÚBLICOS ----------------------------------//
Route::prefix('v1')->group(function () {
    Route::get('/espacios', [EspacioController::class, 'index'])->name('espacios.index');
    Route::get('/espacios/{slug}', [EspacioController::class, 'show'])->name('espacios.show');
});

//------------------------------- ESCRITORIOS ----------------------------------//
Route::prefix('v1')->group(function () {
    Route::get('/escritorios', [EscritorioController::class, 'index'])->name('escritorios.index');
    Route::get('/escritorios/{id}', [EscritorioController::class, 'show'])->name('escritorios.show');
});

require __DIR__ . '/auth.php';