<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth; // Importación añadida para resolver los errores
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    /**
     * Obtener listado de usuarios con posible ordenación y filtrado
     *
     * @param string $orderBy Campo por el cual ordenar
     * @param string $direction Dirección de la ordenación (asc/desc)
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllUsers(string $orderBy = 'name', string $direction = 'asc')
    {
        return User::orderBy($orderBy, $direction)->get();
    }

    /**
     * Crear un nuevo usuario
     *
     * @param array $userData Datos validados del usuario
     * @param bool $canAssignRoles Si el creador tiene permisos para asignar roles
     * @return User
     */
    public function createUser(array $userData, bool $canAssignRoles = false)
    {
        try {
            // Preparar datos específicos
            
            // Determinar el rol según permisos
            if (!$canAssignRoles || !isset($userData['role'])) {
                $userData['role'] = 'user'; // Rol por defecto
            }
            
            // Encriptar contraseña
            if (isset($userData['password'])) {
                $userData['password'] = Hash::make($userData['password']);
            }
            
            // Crear usuario
            $user = User::create($userData);
            
            // Registrar la operación exitosa
            Log::info('Usuario creado exitosamente por servicio', [
                'user_id' => $user->id,
                'created_by' => Auth::id() ?? 'system', // Cambio de auth()->id() a Auth::id()
                'role_assigned' => $user->role
            ]);
            
            return $user;
        } catch (\Exception $e) {
            // Registrar el error
            Log::error('Error en servicio al crear usuario', [
                'error' => $e->getMessage(),
                'created_by' => Auth::id() ?? 'system' // Cambio de auth()->id() a Auth::id()
            ]);
            
            // Re-lanzar la excepción para que el controlador pueda manejarla
            throw $e;
        }
    }
    
    /**
     * Actualizar un usuario existente
     *
     * @param User $user Usuario a actualizar
     * @param array $userData Datos validados del usuario
     * @param bool $canAssignRoles Si el editor tiene permisos para asignar roles
     * @return User
     */
    public function updateUser(User $user, array $userData, bool $canAssignRoles = false)
    {
        try {
            // Si no puede asignar roles, mantener el rol actual
            if (!$canAssignRoles) {
                unset($userData['role']);
            }
            
            // Actualizar contraseña solo si viene especificada y no está vacía
            if (isset($userData['password']) && !empty($userData['password'])) {
                $userData['password'] = Hash::make($userData['password']);
            } else {
                unset($userData['password']);
            }
            
            // Actualizar usuario
            $user->update($userData);
            
            // Registrar la operación exitosa
            Log::info('Usuario actualizado exitosamente por servicio', [
                'user_id' => $user->id,
                'updated_by' => Auth::id() ?? 'system', // Cambio de auth()->id() a Auth::id()
                'role_assigned' => $user->role
            ]);
            
            return $user;
        } catch (\Exception $e) {
            // Registrar el error
            Log::error('Error en servicio al actualizar usuario', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'updated_by' => Auth::id() ?? 'system' // Cambio de auth()->id() a Auth::id()
            ]);
            
            // Re-lanzar la excepción para que el controlador pueda manejarla
            throw $e;
        }
    }
    
    /**
     * Eliminar un usuario
     *
     * @param User $user Usuario a eliminar
     * @return bool|null Resultado de la operación de eliminación
     * @throws \Exception Si se intenta eliminar al usuario autenticado
     */
    public function deleteUser(User $user)
    {
        try {
            // Verificar que no se elimine el propio usuario autenticado
            if (Auth::check() && Auth::id() == $user->id) { // Cambio de auth()->check() a Auth::check() y auth()->id() a Auth::id()
                throw new \Exception('No puedes eliminar tu propio usuario.');
            }
            
            // Almacenar datos para el log antes de eliminar
            $userId = $user->id;
            $userName = $user->name;
            $userEmail = $user->email;
            $userRole = $user->role;
            
            // Eliminar usuario
            $result = $user->delete();
            
            // Registrar la operación exitosa
            Log::info('Usuario eliminado exitosamente por servicio', [
                'deleted_user' => [
                    'id' => $userId,
                    'name' => $userName,
                    'email' => $userEmail,
                    'role' => $userRole
                ],
                'deleted_by' => Auth::id() ?? 'system' // Cambio de auth()->id() a Auth::id()
            ]);
            
            return $result;
        } catch (\Exception $e) {
            // Registrar el error
            Log::error('Error en servicio al eliminar usuario', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'deleted_by' => Auth::id() ?? 'system' // Cambio de auth()->id() a Auth::id()
            ]);
            
            // Re-lanzar la excepción para que el controlador pueda manejarla
            throw $e;
        }
    }
    
    /**
     * Determina si el usuario autenticado puede gestionar roles
     *
     * @return bool
     */
    public function canManageRoles()
    {
        return Auth::check() && Auth::user()->role === 'superadmin'; // Cambio de auth()->check() a Auth::check() y auth()->user() a Auth::user()
    }
    
    /**
     * Buscar un usuario por ID
     * 
     * @param int $id ID del usuario
     * @return User
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getUserById($id)
    {
        return User::findOrFail($id);
    }
}