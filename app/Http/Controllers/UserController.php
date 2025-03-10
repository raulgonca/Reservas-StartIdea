<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest; 
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * El servicio de usuarios.
     *
     * @var \App\Services\UserService
     */
    protected $userService;
    
    /**
     * Crea una nueva instancia del controlador.
     *
     * @param  \App\Services\UserService  $userService
     * @return void
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    
    /**
     * Redireccionar a la lista de usuarios según el rol del usuario autenticado.
     *
     * @param string $message Mensaje opcional de éxito para mostrar
     * @return \Illuminate\Http\RedirectResponse
     */
    private function redirectToUsersList($message = null)
    {
        $route = Auth::user()->role === 'superadmin' 
            ? 'superadmin.users.index' 
            : 'admin.users.index';
        
        return $message 
            ? redirect()->route($route)->with('success', $message)
            : redirect()->route($route);
    }
    
    /**
     * Mostrar la lista de usuarios.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        try {
            // Obtener los parámetros de filtrado
            $filter = $request->input('filter', 'all');
            $search = $request->input('search', '');
            
            // Consultar usuarios aplicando paginación
            $query = User::query();
            
            // Aplicar filtro por rol si no es "all"
            if ($filter !== 'all') {
                $query->where('role', $filter);
            }
            
            // Aplicar búsqueda si existe
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('dni', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }
            
            // Para admin, solo mostrar usuarios normales (no otros administradores)
            if (Auth::user()->role === 'admin') {
                $query->where('role', 'user');
            }
            
            // Paginar los resultados - 10 por página
            $users = $query->orderBy('name')->paginate(10)->withQueryString();
            
            // Renderizar la vista con los usuarios paginados
            return Inertia::render('SuperAdmin/UserCrud/UsersList', [
                'users' => $users,
                'canAssignRoles' => $this->userService->canManageRoles(),
                'filters' => [
                    'filter' => $filter,
                    'search' => $search
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar la lista de usuarios:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            return back()->withErrors(['error' => 'Error al cargar la lista de usuarios.']);
        }
    }

    /**
     * Mostrar el formulario para crear un nuevo usuario.
     *
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function create()
    {
        try {
            // Usando la ruta correcta SuperAdmin/UserCrud
            return Inertia::render('SuperAdmin/UserCrud/CreateUser', [
                'canAssignRoles' => $this->userService->canManageRoles()
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar el formulario de creación:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            return back()->withErrors(['error' => 'Error al cargar el formulario.']);
        }
    }

    /**
     * Manejar una solicitud de creación de usuario.
     *
     * @param  \App\Http\Requests\User\StoreUserRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        try {
            // Los datos ya están validados por el FormRequest
            $validatedData = $request->validated();
            
            // Utilizar el servicio para crear el usuario
            $user = $this->userService->createUser($validatedData, $this->userService->canManageRoles());
            
            // Redirigir con mensaje de éxito
            return $this->redirectToUsersList('Usuario creado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al crear usuario:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            return back()->withErrors(['error' => 'Error al crear el usuario.'])->withInput();
        }
    }

    /**
     * Mostrar el formulario para editar un usuario existente.
     *
     * @param  int  $id
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function edit($id)
    {
        try {
            // Buscar el usuario por su ID usando el servicio
            $user = $this->userService->getUserById($id);
            
            // Renderizar vista con datos - Usando la ruta correcta SuperAdmin/UserCrud
            return Inertia::render('SuperAdmin/UserCrud/EditUser', [
                'user' => $user,
                'canAssignRoles' => $this->userService->canManageRoles()
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar formulario de edición:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $id
            ]);
            return back()->withErrors(['error' => 'Error al cargar los datos del usuario.']);
        }
    }

    /**
     * Manejar una solicitud de actualización de un usuario existente.
     *
     * @param  \App\Http\Requests\User\UpdateUserRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(UpdateUserRequest $request, $id): RedirectResponse
    {
        try {
            // Los datos ya están validados por el FormRequest
            $validatedData = $request->validated();
            
            // Buscar el usuario usando el servicio
            $user = $this->userService->getUserById($id);
            
            // Utilizar el servicio para actualizar el usuario
            $this->userService->updateUser($user, $validatedData, $this->userService->canManageRoles());
            
            // Redirigir con mensaje de éxito
            return $this->redirectToUsersList('Usuario actualizado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $id
            ]);
            return back()->withErrors(['error' => 'Error al actualizar el usuario.'])->withInput();
        }
    }

    /**
     * Manejar una solicitud de eliminación de un usuario.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id): RedirectResponse
    {
        try {
            // Buscar el usuario usando el servicio
            $user = $this->userService->getUserById($id);
            
            // Verificar autorización manualmente ya que no usamos FormRequest para delete
            if (Auth::user()->role === 'admin' && $user->role !== 'user') {
                throw new \Exception('No tienes permiso para eliminar este usuario.');
            }
            
            if (Auth::id() === $user->id) {
                throw new \Exception('No puedes eliminar tu propio usuario.');
            }
            
            // Utilizar el servicio para eliminar el usuario
            $this->userService->deleteUser($user);
            
            // Redirigir con mensaje de éxito
            return $this->redirectToUsersList('Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $id
            ]);
            return back()->withErrors(['error' => $e->getMessage() ?: 'Error al eliminar el usuario.']);
        }
    }
}