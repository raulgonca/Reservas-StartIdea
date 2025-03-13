import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // No renderizar paginación si solo hay una página
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap -mb-1">
            {links.map((link, key) => (
                <React.Fragment key={key}>
                    {link.url === null ? (
                        <div
                            className="mr-1 mb-1 px-4 py-2 text-sm border rounded text-gray-400 dark:text-gray-600"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            className={`mr-1 mb-1 px-4 py-2 text-sm border rounded focus:outline-none 
                                ${link.active ? 
                                    'border-indigo-500 bg-indigo-500 text-white dark:border-indigo-600 dark:bg-indigo-600' : 
                                    'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}