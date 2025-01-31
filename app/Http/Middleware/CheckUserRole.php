<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserRole
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && in_array(Auth::user()->role, ['user', 'admin', 'superadmin'])) {
            return $next($request);
        }

        return redirect('/')->with('error', 'No tienes permiso para acceder a esta página.');
    }
}