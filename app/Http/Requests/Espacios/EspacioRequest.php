<?php

namespace App\Http\Requests\Espacios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EspacioRequest extends FormRequest
{
    /**
     * Determine si el usuario está autorizado para realizar esta solicitud.
     *
     * @return bool
     */
    public function authorize()
    {
        // La autorización se maneja en las rutas/middleware, por lo que aquí siempre retornamos true
        return true;
    }

    /**
     * Obtiene las reglas de validación que aplican a la solicitud.
     *
     * @return array
     */
    public function rules()
    {
        $isUpdate = $this->route('espacio') || $this->route('id');
        
        $rules = [
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|in:sala,coworking,radio,despacho',
            'aforo' => 'nullable|integer|min:1',
            'horario_inicio' => 'nullable|date_format:H:i',
            'horario_fin' => 'nullable|date_format:H:i|after:horario_inicio',
            'descripcion' => 'nullable|string',
            'features' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'image' => $isUpdate ? 'nullable|image|max:2048' : 'required|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
            'escritorios' => 'nullable|array',
            'escritorios.*.id' => [
                'nullable', 
                'integer', 
                Rule::exists('escritorios', 'id')->where(function ($query) {
                    // Solo considerar IDs de escritorios válidos para este espacio
                    if ($espacio = $this->route('espacio') ?? $this->route('id')) {
                        $query->where('espacio_id', $espacio);
                    }
                })
            ],
            'escritorios.*.numero' => 'required_with:escritorios|string|max:255',
            'escritorios.*.is_active' => 'nullable|boolean',
        ];
        
        // Regla condicional para espacios tipo coworking
        if ($this->input('tipo') === 'coworking') {
            $rules['escritorios'] = 'required|array|min:1';
        }
        
        return $rules;
    }
    
    /**
     * Obtiene mensajes de error personalizados para las reglas de validación.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'nombre.required' => 'El nombre del espacio es obligatorio.',
            'nombre.max' => 'El nombre no puede tener más de :max caracteres.',
            'tipo.required' => 'Debe seleccionar un tipo de espacio.',
            'tipo.in' => 'El tipo seleccionado no es válido.',
            'aforo.integer' => 'El aforo debe ser un número entero.',
            'aforo.min' => 'El aforo debe ser al menos :min.',
            'horario_inicio.date_format' => 'El formato de la hora de inicio debe ser HH:MM.',
            'horario_fin.date_format' => 'El formato de la hora de fin debe ser HH:MM.',
            'horario_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un valor numérico.',
            'price.min' => 'El precio no puede ser negativo.',
            'image.required' => 'Debe subir una imagen principal para el espacio.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no debe superar los :max kilobytes.',
            'gallery.*.image' => 'Todos los archivos de la galería deben ser imágenes.',
            'escritorios.required' => 'Los espacios de tipo coworking deben tener al menos un escritorio.',
            'escritorios.min' => 'Debe definir al menos :min escritorio.',
            'escritorios.*.numero.required_with' => 'Cada escritorio debe tener un número o identificador.',
            'escritorios.*.id.exists' => 'Uno de los escritorios seleccionados no existe o no pertenece a este espacio.'
        ];
    }
    
    /**
     * Configure los datos de la solicitud antes de que se apliquen las reglas de validación.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Asegurarse que features siempre es un array si está presente
        if ($this->has('features') && is_string($this->features)) {
            $this->merge([
                'features' => json_decode($this->features, true) ?? []
            ]);
        }
    }
}