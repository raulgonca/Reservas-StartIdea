<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminRegisterController extends Controller
{
    /**
     * Mostrar el formulario para crear un nuevo usuario.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/CreateUser');
    }

    /**
     * Manejar una solicitud de creación de usuario por parte del superadministrador.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Validar los datos de la solicitud
        $request->validate([
            'name' => 'required|string|max:255', // Nombre obligatorio, máximo 255 caracteres.
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class, // Email obligatorio, único en la tabla users.
            'password' => ['required', 'confirmed', Rules\Password::defaults()], // Contraseña obligatoria y confirmada.
            'phone' => ['required', 'string', 'max:15', 'regex:/^[6789]\d{8}$/'], // Teléfono obligatorio, formato español (9 dígitos, empieza con 6,7,8 o 9).
            'dni' => ['required', 'string', 'max:20', 'unique:'.User::class, 'regex:/^\d{8}[A-Za-z]$/'], // DNI obligatorio, único, formato español (8 dígitos + 1 letra).
            'role' => 'required|string|in:user,admin,superadmin', // Rol obligatorio, debe ser uno de los valores especificados.
        ]);

        // Crear un nuevo usuario con los datos proporcionados
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'dni' => $request->dni,
            'role' => $request->role, // Asignar rol proporcionado por el superadministrador
        ]);

        // Redirigir al superadministrador a la lista de usuarios con un mensaje de éxito
        return redirect()->route('v1.admin.users.index')->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Mostrar el formulario para editar un usuario existente.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        // Buscar el usuario por su ID
        $user = User::findOrFail($id);
        // Renderizar la vista de edición con los datos del usuario
        return Inertia::render('Admin/EditUser', ['user' => $user]);
    }

    /**
     * Manejar una solicitud de actualización de un usuario existente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id): RedirectResponse
    {
        // Validar los datos de la solicitud
        $request->validate([
            'name' => 'required|string|max:255', // Nombre obligatorio, máximo 255 caracteres.
            'email' => 'required|string|email|max:255|unique:users,email,' . $id, // Email obligatorio, único en la tabla users, excepto para el usuario actual.
            'password' => 'required|nullable|string|min:8|confirmed', // Contraseña obligatoria, mínimo 8 caracteres y confirmada.
            'phone' => ['required', 'string', 'max:15', 'regex:/^[6789]\d{8}$/'], // Teléfono obligatorio, formato español (9 dígitos, empieza con 6,7,8 o 9).
            'dni' => ['required', 'string', 'max:20', 'unique:users,dni,' . $id, 'regex:/^\d{8}[A-Za-z]$/'], // DNI obligatorio, único, formato español (8 dígitos + 1 letra), excepto para el usuario actual.
            'role' => 'required|string|in:user,admin,superadmin', // Rol obligatorio, debe ser uno de los valores especificados.
        ]);

        // Buscar el usuario por su ID
        $user = User::findOrFail($id);

        // Actualizar los datos del usuario con los valores proporcionados
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password, // Actualizar contraseña solo si se proporciona.
            'phone' => $request->phone,
            'dni' => $request->dni,
            'role' => $request->role, // Asignar rol proporcionado por el superadministrador
        ]);

        // Redirigir al superadministrador a la lista de usuarios con un mensaje de éxito
        return redirect()->route('v1.admin.users.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Manejar una solicitud de eliminación de un usuario.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id): RedirectResponse
    {
        // Buscar el usuario por su ID
        $user = User::findOrFail($id);

        // Eliminar el usuario
        $user->delete();

        // Redirigir al superadministrador a la lista de usuarios con un mensaje de éxito
        return redirect()->route('v1.admin.users.index')->with('success', 'Usuario eliminado exitosamente.');
    }
}