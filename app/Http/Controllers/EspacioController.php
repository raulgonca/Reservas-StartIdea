<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use App\Models\Escritorio;
use App\Models\Reserva;
use App\Http\Requests\Espacios\EspacioRequest; // Nuevo import para el Form Request
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use App\Services\MediaService;
use App\Services\AvailabilityService;

/**
 * Controlador para la gestión de espacios y su disponibilidad
 */
class EspacioController extends Controller
{
    /**
     * El servicio de medios
     *
     * @var MediaService
     */
    protected $mediaService;

    /**
     * El servicio de disponibilidad
     *
     * @var AvailabilityService
     */
    protected $availabilityService;

    /**
     * Constructor del controlador
     * 
     * @param MediaService $mediaService
     * @param AvailabilityService $availabilityService
     */
    public function __construct(MediaService $mediaService, AvailabilityService $availabilityService)
    {
        $this->mediaService = $mediaService;
        $this->availabilityService = $availabilityService;
    }

    /**
     * Muestra la lista de espacios activos en la página principal o panel de admin
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Detectar si estamos en rutas de admin
        $routeName = $request->route()->getName();
        $isAdmin = Str::startsWith($routeName, 'admin.') || Str::startsWith($routeName, 'superadmin.');

        if ($isAdmin) {
            // Vista para administradores con todos los espacios
            $espacios = Espacio::with('escritorios')
                ->when($request->search, function ($query, $search) {
                    $query->where('nombre', 'like', "%{$search}%");
                })
                ->when($request->tipo, function ($query, $tipo) {
                    $query->where('tipo', $tipo);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString();

            $viewPrefix = 'Admin'; // Siempre usando Admin independientemente de la ruta
            $viewName = "{$viewPrefix}/Espacios/Index";

            return Inertia::render($viewName, [
                'espacios' => $espacios,
                'filters' => $request->only(['search', 'tipo']),
                'routePrefix' => Str::startsWith($routeName, 'admin.') ? 'admin' : 'superadmin'
            ]);
        }

        // Vista pública principal con espacios activos
        $espacios = Espacio::where('is_active', true)
            ->select('id', 'nombre', 'slug', 'descripcion', 'image', 'features', 'aforo', 'price', 'tipo')
            ->get()
            ->map(function ($espacio) {
                return [
                    'id' => $espacio->id,
                    'nombre' => $espacio->nombre,
                    'slug' => $espacio->slug,
                    'descripcion' => $espacio->descripcion,
                    'image_url' => $espacio->image_url,
                    'gallery_media' => $espacio->gallery_media,
                    'features' => is_string($espacio->features) ? json_decode($espacio->features, true) : ($espacio->features ?? []),
                    'aforo' => $espacio->aforo,
                    'price' => $espacio->price,
                    'tipo' => $espacio->tipo
                ];
            });

        return Inertia::render('Welcome', [
            'auth' => ['user' => Auth::check() ? Auth::user() : null],
            'espacios' => $espacios,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo espacio
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Detectar si estamos en rutas de admin o superadmin
        $routeName = request()->route()->getName();

        // MODIFICACIÓN: Siempre usar Admin como prefijo de vista
        $viewPrefix = 'Admin';

        return Inertia::render("{$viewPrefix}/Espacios/Create", [
            'tipos' => ['sala', 'coworking', 'radio', 'despacho'],
            'routePrefix' => Str::startsWith($routeName, 'admin.') ? 'admin' : 'superadmin'
        ]);
    }

    /**
     * Almacena un nuevo espacio en la base de datos
     *
     * @param EspacioRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(EspacioRequest $request)
    {
        // Los datos ya están validados por el Form Request
        $validated = $request->validated();

        // Crear el espacio con los datos validados
        $espacio = new Espacio();
        $espacio->nombre = $validated['nombre'];
        $espacio->slug = Str::slug($validated['nombre']);
        $espacio->tipo = $validated['tipo'];
        $espacio->aforo = $validated['aforo'];
        $espacio->horario_inicio = $validated['horario_inicio'];
        $espacio->horario_fin = $validated['horario_fin'];
        $espacio->disponible_24_7 = $request->has('disponible_24_7');
        $espacio->descripcion = $validated['descripcion'];
        $espacio->features = $validated['features'] ?? [];
        $espacio->price = $validated['price'];
        $espacio->is_active = $request->has('is_active');

        // Procesar la imagen principal si se ha subido
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('espacios/' . Str::slug($validated['nombre']), 'public');
            $espacio->image = $path;
        }

        // Guardar el espacio
        $espacio->save();

        // Procesar imágenes adicionales si se han subido
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $path = $file->store('espacios/' . $espacio->slug . '/gallery', 'public');
                // Aquí deberíamos guardar la referencia a la imagen en una tabla relacionada
                // o en un campo JSON si el modelo lo permite
            }
        }

        // Para espacios tipo coworking, crear escritorios
        if ($validated['tipo'] === 'coworking' && isset($validated['escritorios']) && is_array($validated['escritorios'])) {
            foreach ($validated['escritorios'] as $escritorioData) {
                $escritorio = new Escritorio();
                $escritorio->espacio_id = $espacio->id;
                $escritorio->numero = $escritorioData['numero'];
                $escritorio->is_active = $escritorioData['is_active'] ?? true;
                $escritorio->save();
            }
        }

        // Redirigir de vuelta a la lista de espacios con mensaje de éxito
        $routePrefix = Str::startsWith($request->route()->getName(), 'admin.') ? 'admin' : 'superadmin';

        return redirect()->route("{$routePrefix}.espacios.index")
            ->with('message', 'Espacio creado correctamente');
    }

    /**
     * Muestra el formulario para editar un espacio existente
     *
     * @param int $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        $espacio = Espacio::with('escritorios')->findOrFail($id);

        // Detectar si estamos en rutas de admin o superadmin
        $routeName = request()->route()->getName();

        // MODIFICACIÓN: Siempre usar Admin como prefijo de vista
        $viewPrefix = 'Admin';

        return Inertia::render("{$viewPrefix}/Espacios/Edit", [
            'espacio' => $espacio,
            'tipos' => ['sala', 'coworking', 'radio', 'despacho'],
            'media' => [
                'image_url' => $espacio->image_url,
                'gallery' => $espacio->gallery_media
            ],
            'routePrefix' => Str::startsWith($routeName, 'admin.') ? 'admin' : 'superadmin'
        ]);
    }

    /**
     * Actualiza un espacio existente en la base de datos
     *
     * @param EspacioRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(EspacioRequest $request, $id)
    {
        $espacio = Espacio::findOrFail($id);

        // Los datos ya están validados por el Form Request
        $validated = $request->validated();

        // Actualizar el espacio con los datos validados
        $espacio->nombre = $validated['nombre'];
        $espacio->slug = Str::slug($validated['nombre']);
        $espacio->tipo = $validated['tipo'];
        $espacio->aforo = $validated['aforo'];
        $espacio->horario_inicio = $validated['horario_inicio'];
        $espacio->horario_fin = $validated['horario_fin'];
        $espacio->disponible_24_7 = $request->has('disponible_24_7');
        $espacio->descripcion = $validated['descripcion'];
        $espacio->features = $validated['features'] ?? [];
        $espacio->price = $validated['price'];
        $espacio->is_active = $request->has('is_active');

        // Procesar la imagen principal si se ha subido
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior si existe
            if ($espacio->image && Storage::disk('public')->exists($espacio->image)) {
                Storage::disk('public')->delete($espacio->image);
            }

            $path = $request->file('image')->store('espacios/' . Str::slug($validated['nombre']), 'public');
            $espacio->image = $path;
        }

        // Guardar el espacio
        $espacio->save();

        // Procesar imágenes adicionales si se han subido
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $path = $file->store('espacios/' . $espacio->slug . '/gallery', 'public');
                // Aquí deberíamos guardar la referencia a la imagen en una tabla relacionada
                // o en un campo JSON si el modelo lo permite
            }
        }

        // Manejar escritorios para espacios de tipo coworking
        if ($validated['tipo'] === 'coworking') {
            if (isset($validated['escritorios']) && is_array($validated['escritorios'])) {
                // IDs de escritorios existentes
                $escritoriosExistentes = $espacio->escritorios->pluck('id')->toArray();

                // Procesar cada escritorio de la solicitud
                $procesados = [];

                foreach ($validated['escritorios'] as $escritorioData) {
                    if (isset($escritorioData['id'])) {
                        // Actualizar escritorio existente
                        $escritorio = Escritorio::findOrFail($escritorioData['id']);
                        $escritorio->numero = $escritorioData['numero'];
                        $escritorio->is_active = $escritorioData['is_active'] ?? true;
                        $escritorio->save();

                        $procesados[] = $escritorio->id;
                    } else {
                        // Crear nuevo escritorio
                        $escritorio = new Escritorio();
                        $escritorio->espacio_id = $espacio->id;
                        $escritorio->numero = $escritorioData['numero'];
                        $escritorio->is_active = $escritorioData['is_active'] ?? true;
                        $escritorio->save();

                        $procesados[] = $escritorio->id;
                    }
                }

                // Eliminar escritorios que ya no están en la lista
                $eliminar = array_diff($escritoriosExistentes, $procesados);
                if (!empty($eliminar)) {
                    Escritorio::whereIn('id', $eliminar)->delete();
                }
            }
        } else {
            // Si el espacio ya no es de tipo coworking, eliminar todos los escritorios
            $espacio->escritorios()->delete();
        }

        // Redirigir de vuelta a la lista de espacios con mensaje de éxito
        $routePrefix = Str::startsWith($request->route()->getName(), 'admin.') ? 'admin' : 'superadmin';

        return redirect()->route("{$routePrefix}.espacios.index")
            ->with('message', 'Espacio actualizado correctamente');
    }

    /**
     * Elimina un espacio de la base de datos
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $espacio = Espacio::findOrFail($id);

        // Eliminar escritorios relacionados
        $espacio->escritorios()->delete();

        // Eliminar imágenes asociadas
        if ($espacio->image && Storage::disk('public')->exists($espacio->image)) {
            Storage::disk('public')->delete($espacio->image);
        }

        // Eliminar directorio de galería si existe
        $galleryPath = 'espacios/' . $espacio->slug . '/gallery';
        if (Storage::disk('public')->exists($galleryPath)) {
            Storage::disk('public')->deleteDirectory($galleryPath);
        }

        // Eliminar el espacio
        $espacio->delete();

        // Redirigir de vuelta a la lista de espacios con mensaje de éxito
        $routePrefix = Str::startsWith(request()->route()->getName(), 'admin.') ? 'admin' : 'superadmin';

        return redirect()->route("{$routePrefix}.espacios.index")
            ->with('message', 'Espacio eliminado correctamente');
    }

    /**
     * Cambia el estado de activación (visibilidad) de un espacio
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleActive($id)
    {
        $espacio = Espacio::findOrFail($id);
        $espacio->is_active = !$espacio->is_active;
        $espacio->save();

        // Redirigir de vuelta a la lista de espacios con mensaje de éxito
        $routePrefix = Str::startsWith(request()->route()->getName(), 'admin.') ? 'admin' : 'superadmin';

        return redirect()->route("{$routePrefix}.espacios.index")
            ->with('message', 'Estado del espacio actualizado correctamente');
    }

    /**
     * Muestra los detalles de un espacio específico
     *
     * @param string $slug
     * @return \Inertia\Response
     */
    public function show($slug)
    {
        $espacio = Espacio::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Espacios/Show', [
            'espacio' => $espacio
        ]);
    }

    /**
     * Obtiene la disponibilidad de un espacio para una fecha específica
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function getAvailability(Request $request, $id): JsonResponse
    {
        try {
            $espacio = Espacio::findOrFail($id);

            // Parseo explícito de la fecha con validación
            try {
                $fecha = Carbon::parse($request->fecha);
            } catch (\Exception $e) {
                // Si hay error al parsear la fecha, usar la fecha actual
                $fecha = Carbon::today();
                Log::warning('Fecha inválida en la solicitud, usando fecha actual', [
                    'fecha_solicitada' => $request->fecha,
                    'fecha_usada' => $fecha->format('Y-m-d')
                ]);
            }

            $vista = $request->vista ?? 'day';
            $escritorio_id = $request->escritorio;

            Log::info('Consultando disponibilidad', [
                'espacio_id' => $id,
                'fecha' => $fecha->toDateString(),
                'tipo_espacio' => $espacio->tipo,
                'vista' => $vista,
                'escritorio_id' => $escritorio_id
            ]);

            // Usar el servicio de disponibilidad
            $result = $this->availabilityService->getEspacioAvailability(
                $espacio,
                $fecha,
                $vista,
                $escritorio_id
            );

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error en getAvailability: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener disponibilidad'], 500);
        }
    }

    /**
     * Obtiene la disponibilidad de los escritorios para un espacio
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function getDesksAvailability(Request $request, $id): JsonResponse
    {
        try {
            $espacio = Espacio::findOrFail($id);

            if ($espacio->tipo !== 'coworking') {
                return response()->json([
                    'error' => 'Este espacio no tiene escritorios disponibles'
                ], 400);
            }

            $fecha = Carbon::parse($request->fecha);

            // Usar el servicio de disponibilidad
            $result = $this->availabilityService->getDesksAvailability($espacio, $fecha);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error en getDesksAvailability: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener disponibilidad de escritorios'], 500);
        }
    }
}
