<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckSuperAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && Auth::user()->role === 'superadmin') {
            return $next($request);
        }

        return redirect('/')->with('error', 'No tienes permiso para acceder a esta página.');
    }
}