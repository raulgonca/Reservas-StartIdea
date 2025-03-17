import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // No renderizar paginación si solo hay una página
    if (links.length <= 3) {
        return null;
    }

    /**
     * Traduce las etiquetas de paginación al español
     * @param {string} label - Etiqueta original del paginador
     * @returns {string} - Etiqueta traducida
     */
    const translatePagination = (label) => {
        // Diccionario de traducciones
        const translations = {
            '&laquo; Previous': '&laquo; Anterior',
            'Next &raquo;': 'Siguiente &raquo;',
            'pagination.previous': '&laquo; Anterior',
            'pagination.next': 'Siguiente &raquo;'
        };

        // Devolver la traducción o la etiqueta original si no existe traducción
        return translations[label] || label;
    };

    return (
        <div className="flex flex-wrap -mb-1">
            {links.map((link, key) => (
                <React.Fragment key={key}>
                    {link.url === null ? (
                        <div
                            className="mr-1 mb-1 px-4 py-2 text-sm border rounded text-gray-400 dark:text-gray-600"
                            dangerouslySetInnerHTML={{ __html: translatePagination(link.label) }}
                        />
                    ) : (
                        <Link
                            className={`mr-1 mb-1 px-4 py-2 text-sm border rounded focus:outline-none 
                                ${link.active ? 
                                    'border-indigo-500 bg-indigo-500 text-white dark:border-indigo-600 dark:bg-indigo-600' : 
                                    'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: translatePagination(link.label) }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}