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


//------------------------------- USUARIOS ----------------------------------//

// Prefijo de versión para las rutas de usuarios
Route::prefix('v1/user')->middleware(['auth', 'user'])->group(function () {
    // Rutas para mostrar y listar las reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('user.reservas.index');
    Route::get('/reservas/{id}', [ReservaController::class, 'show'])->name('user.reservas.show');
});

//------------------------------- PERFIL DE USUARIO ----------------------------------//

// Prefijo de versión para las rutas de autenticación
Route::prefix('v1')->middleware('auth')->group(function () {
    // Ruta para editar el perfil del usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Ruta para actualizar el perfil del usuario
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Ruta para eliminar el perfil del usuario
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//------------------------------- ADMINISTRADOR ----------------------------------//

// Prefijo de versión para las rutas del administrador
Route::prefix('v1/admin')->middleware(['auth'])->group(function () {
    // Rutas para gestionar reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('admin.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('admin.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('admin.reservas.store');
    Route::get('/reservas/{id}/edit', [ReservaController::class, 'edit'])->name('admin.reservas.edit');
    Route::patch('/reservas/{id}', [ReservaController::class, 'update'])->name('admin.reservas.update');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('admin.reservas.destroy');
});

//------------------------------- BLOQUEOS ----------------------------------//

// Prefijo de versión para las rutas de bloqueos
Route::prefix('v1')->middleware('admin')->group(function () {
    // Rutas para mostrar y listar los bloqueos
    Route::get('/bloqueos', [BloqueoController::class, 'index'])->name('bloqueos.index');
    Route::get('/bloqueos/{id}', [BloqueoController::class, 'show'])->name('bloqueos.show');

    // Rutas para crear y almacenar bloqueos
    Route::get('/bloqueos/create', [BloqueoController::class, 'create'])->name('bloqueos.create');
    Route::post('/bloqueos', [BloqueoController::class, 'store'])->name('bloqueos.store');
});

//------------------------------- RESERVAS RECURRENTES ----------------------------------//

// Prefijo de versión para las rutas de reservas recurrentes
Route::prefix('v1')->middleware('admin')->group(function () {
    // Rutas para mostrar y listar las reservas recurrentes
    Route::get('/reservas_recurrentes', [ReservaRecurrenteController::class, 'index'])->name('reservas_recurrentes.index');
    Route::get('/reservas_recurrentes/{id}', [ReservaRecurrenteController::class, 'show'])->name('reservas_recurrentes.show');

    // Rutas para crear y almacenar reservas recurrentes
    Route::get('/reservas_recurrentes/create', [ReservaRecurrenteController::class, 'create'])->name('reservas_recurrentes.create');
    Route::post('/reservas_recurrentes', [ReservaRecurrenteController::class, 'store'])->name('reservas_recurrentes.store');
});


//------------------------------- SUPER ADMIN ----------------------------------//

// Prefijo de versión para las rutas del superadministrador
Route::prefix('v1/superadmin')->middleware(['auth'])->group(function () {

    // Ruta para mostrar el formulario de creación de usuarios
    Route::get('/users/create', [SuperAdminRegisterController::class, 'create'])->name('superadmin.users.create');
    // Ruta para manejar la creación de usuarios
    Route::post('/users', [SuperAdminRegisterController::class, 'store'])->name('superadmin.users.store');
    // Ruta para mostrar el formulario de edición de usuarios
    Route::get('/users/{id}/edit', [SuperAdminRegisterController::class, 'edit'])->name('superadmin.users.edit');
    // Ruta para manejar la actualización de usuarios
    Route::patch('/users/{id}', [SuperAdminRegisterController::class, 'update'])->name('superadmin.users.update');
    // Ruta para manejar la eliminación de usuarios
    Route::delete('/users/{id}', [SuperAdminRegisterController::class, 'destroy'])->name('superadmin.users.destroy');
    // Ruta para listar usuarios
    Route::get('/users', [SuperAdminRegisterController::class, 'index'])->name('superadmin.users.index');


    // Rutas para gestionar reservas
    Route::get('/reservas', [ReservaController::class, 'index'])->name('superadmin.reservas.index');
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('superadmin.reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('superadmin.reservas.store');
    Route::get('/reservas/{id}/edit', [ReservaController::class, 'edit'])->name('superadmin.reservas.edit');
    Route::patch('/reservas/{id}', [ReservaController::class, 'update'])->name('superadmin.reservas.update');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('superadmin.reservas.destroy');

    // Rutas para mostrar y listar los espacios
    Route::get('/espacios', [EspacioController::class, 'index'])->name('superadmin.espacios.index');
    Route::get('/espacios/{id}', [EspacioController::class, 'show'])->name('superadmin.espacios.show');

    // Rutas para crear, almacenar, editar, actualizar y eliminar espacios
    Route::get('/espacios/create', [EspacioController::class, 'create'])->name('superadmin.espacios.create');
    Route::post('/espacios', [EspacioController::class, 'store'])->name('superadmin.espacios.store');
    Route::get('/espacios/{id}/edit', [EspacioController::class, 'edit'])->name('superadmin.espacios.edit');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->name('superadmin.espacios.update');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->name('superadmin.espacios.destroy');
});




//------------------------------- ESPACIOS ----------------------------------//

// Prefijo de versión para las rutas de espacios
Route::prefix('v1')->group(function () {
    // Rutas para mostrar y listar los espacios
    Route::get('/espacios', [EspacioController::class, 'index'])->name('espacios.index');
    Route::get('/espacios/{id}', [EspacioController::class, 'show'])->name('espacios.show');

    // Rutas para crear, almacenar, editar, actualizar y eliminar espacios
    Route::get('/espacios/create', [EspacioController::class, 'create'])->name('espacios.create');
    Route::post('/espacios', [EspacioController::class, 'store'])->name('espacios.store');
    Route::get('/espacios/{id}/edit', [EspacioController::class, 'edit'])->name('espacios.edit');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->name('espacios.update');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->name('espacios.destroy');
});

//------------------------------- ESCRITORIOS ----------------------------------//

// Prefijo de versión para las rutas de escritorios
Route::prefix('v1')->group(function () {
    // Rutas para mostrar y listar los escritorios
    Route::get('/escritorios', [EscritorioController::class, 'index'])->name('escritorios.index');
    Route::get('/escritorios/{id}', [EscritorioController::class, 'show'])->name('escritorios.show');
});


// Incluir las rutas de autenticación
require __DIR__ . '/auth.php';
