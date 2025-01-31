<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255', // Nombre obligatorio, máximo 255 caracteres.
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class, // Email obligatorio, único en la tabla users.
            'password' => ['required', 'confirmed', Rules\Password::defaults()], // Contraseña obligatoria y confirmada.
            'phone' => ['required', 'string', 'max:15', 'regex:/^[6789]\d{8}$/'], // Teléfono obligatorio, formato español (9 dígitos, empieza con 6,7,8 o 9).
            'dni' => ['required', 'string', 'max:20', 'unique:'.User::class, 'regex:/^\d{8}[A-Za-z]$/'], // DNI obligatorio, único, formato español (8 dígitos + 1 letra).
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'dni' => $request->dni,
            'role' => 'user', // Asignar rol por defecto
        ]);

        event(new Registered($user));

        // Redirigir al usuario a la página de inicio de sesión con un mensaje de éxito
        return redirect(route('login'))->with('status', 'Registro exitoso. Por favor, inicia sesión.');
    }
}