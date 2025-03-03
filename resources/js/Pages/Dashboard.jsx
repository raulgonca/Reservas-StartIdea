import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    En este dashboard podrás agregar métricas, comentarios, blogs y otras funcionalidades necesarias, así como destacar noticias relevantes de los espacios de trabajo.
                </h1>

            }
        >
            <Head title="Dashboard" />


        </AuthenticatedLayout>
    );
}
