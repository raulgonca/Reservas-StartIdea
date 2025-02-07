<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * La plantilla raíz que se carga en la primera visita a la página.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determinar la versión actual del recurso.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Definir las propiedades que se comparten por defecto.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('errors'),
            ],
        ]);
    }
}