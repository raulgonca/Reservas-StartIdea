import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CalendarContainer from '@/Components/Availability/CalendarContainer';

const ReservasIndex = ({ auth, escritorios, weekData, monthData }) => {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reservas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <CalendarContainer 
                                escritorios={escritorios}
                                weekData={weekData}
                                monthData={monthData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ReservasIndex;