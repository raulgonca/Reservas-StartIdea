<?php
namespace App\Http\Controllers;

use App\Models\Escritorio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EscritorioController extends Controller
{
    public function index()
    {
        $escritorios = Escritorio::all();
        return Inertia::render('Escritorios/Index', [
            'escritorios' => $escritorios,
        ]);
    }

    public function show($id)
    {
        $escritorio = Escritorio::findOrFail($id);
        return Inertia::render('Escritorios/Show', [
            'escritorio' => $escritorio,
        ]);
    }
}