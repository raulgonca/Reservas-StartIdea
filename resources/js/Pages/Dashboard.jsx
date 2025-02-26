import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sapiente nam sequi, aspernatur nihil voluptates magnam expedita obcaecati ullam distinctio iure et aliquid repudiandae esse at. Illum, veniam illo! Debitis.
                    
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <p className="text-lg">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sapiente nam sequi, aspernatur nihil voluptates magnam expedita obcaecati ullam distinctio iure et aliquid repudiandae esse at. Illum, veniam illo! Debitis.</p>
                        
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <p className="text-lg">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sapiente nam sequi, aspernatur nihil voluptates magnam expedita obcaecati ullam distinctio iure et aliquid repudiandae esse at. Illum, veniam illo! Debitis.</p>
                        
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <p className="text-lg">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sapiente nam sequi, aspernatur nihil voluptates magnam expedita obcaecati ullam distinctio iure et aliquid repudiandae esse at. Illum, veniam illo! Debitis.</p>
                        
                        </div>
                        <p className="text-lg">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sapiente nam sequi, aspernatur nihil voluptates magnam expedita obcaecati ullam distinctio iure et aliquid repudiandae esse at. Illum, veniam illo! Debitis.</p>
                    </div>
                </div>
            </div>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <p className="text-lg">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sapiente nam sequi, aspernatur nihil voluptates magnam expedita obcaecati ullam distinctio iure et aliquid repudiandae esse at. Illum, veniam illo! Debitis.</p>
                        
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
