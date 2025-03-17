import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function FeatureSelector({ 
    selectedFeatures = [], 
    onChange, 
    error,
    title = "Características",
    className = ""
}) {
    // Lista de características disponibles con sus íconos y etiquetas
    const availableFeatures = [
        // Características básicas
        {
            id: 'WiFi', 
            label: 'WiFi',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
            ),
            group: 'tech'
        },
        {
            id: 'Proyector', 
            label: 'Proyector',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            group: 'tech'
        },
        {
            id: 'Pizarra', 
            label: 'Pizarra',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
            ),
            group: 'tech'
        },
        {
            id: 'Videoconferencia', 
            label: 'Videoconferencia',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            group: 'tech'
        },
        {
            id: 'Impresora', 
            label: 'Impresora',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
            ),
            group: 'tech'
        },
        // Características de confort
        {
            id: 'Aire acondicionado', 
            label: 'Aire acondicionado',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
            ),
            group: 'comfort'
        },
        {
            id: 'Luz natural', 
            label: 'Luz natural',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            group: 'comfort'
        },
        // Servicios adicionales
        {
            id: 'Catering', 
            label: 'Catering',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            ),
            group: 'services'
        },
        {
            id: 'Café', 
            label: 'Café',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
            ),
            group: 'services'
        },
        // Accesibilidad
        {
            id: 'Accesible para sillas de ruedas', 
            label: 'Accesible para sillas de ruedas',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            ),
            group: 'accessibility'
        },
        {
            id: 'Parking', 
            label: 'Parking',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            group: 'accessibility'
        },
    ];

    // Agrupar características por categoría
    const featureGroups = {
        tech: { name: 'Tecnología', items: [] },
        comfort: { name: 'Confort', items: [] },
        services: { name: 'Servicios', items: [] },
        accessibility: { name: 'Accesibilidad', items: [] },
    };

    // Rellenar los grupos
    availableFeatures.forEach(feature => {
        if (featureGroups[feature.group]) {
            featureGroups[feature.group].items.push(feature);
        }
    });

    // Manejar el cambio de estado de una característica
    const toggleFeature = (featureId) => {
        const isSelected = selectedFeatures.includes(featureId);
        
        if (isSelected) {
            // Si ya está seleccionada, la eliminamos
            onChange(selectedFeatures.filter(id => id !== featureId));
        } else {
            // Si no está seleccionada, la añadimos
            onChange([...selectedFeatures, featureId]);
        }
    };

    return (
        <div className={`border-b border-gray-200 dark:border-gray-700 pb-6 ${className}`}>
            <div className="mb-4">
                <InputLabel value={title} />
                {error && <InputError message={error} className="mt-1" />}
            </div>

            <div className="space-y-6">
                {Object.keys(featureGroups).map(groupKey => {
                    const group = featureGroups[groupKey];
                    if (group.items.length === 0) return null;
                    
                    return (
                        <div key={groupKey}>
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                {group.name}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {group.items.map(feature => (
                                    <div 
                                        key={feature.id} 
                                        className={`
                                            flex items-center p-3 rounded-md cursor-pointer transition-all
                                            ${selectedFeatures.includes(feature.id) 
                                                ? 'bg-indigo-100 dark:bg-indigo-900 border border-indigo-300 dark:border-indigo-700' 
                                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'}
                                        `}
                                        onClick={() => toggleFeature(feature.id)}
                                    >
                                        <div className={`mr-3 ${selectedFeatures.includes(feature.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {feature.icon}
                                        </div>
                                        <div className="flex-grow">
                                            <div className={`text-sm font-medium ${selectedFeatures.includes(feature.id) ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {feature.label}
                                            </div>
                                        </div>
                                        <div className="ml-2 flex items-center justify-center">
                                            <input 
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={selectedFeatures.includes(feature.id)}
                                                onChange={() => {}} 
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}