<?php
namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * La pila de middleware globales de la aplicación.
     *
     * Estos middleware se ejecutan durante cada solicitud a la aplicación.
     *
     * @var array
     */
    protected $middleware = [
        // Aquí puedes agregar middlewares globales si es necesario
    ];

    /**
     * Los grupos de middleware de la aplicación.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            // Aquí puedes agregar middlewares específicos para el grupo "web" si es necesario
        ],

        'api' => [
            // Aquí puedes agregar middlewares específicos para el grupo "api" si es necesario
        ],
    ];

    /**
     * Los middleware de ruta de la aplicación.
     *
     * Estos middleware pueden ser asignados a grupos o utilizados individualmente.
     *
     * @var array
     */
    protected $routeMiddleware = [
        'user' => \App\Http\Middleware\CheckUserRole::class,
        'admin' => \App\Http\Middleware\CheckAdminRole::class,
        'superadmin' => \App\Http\Middleware\CheckSuperAdminRole::class,
    ];
}