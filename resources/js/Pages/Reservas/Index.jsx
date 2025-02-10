import React from 'react';
import CreateReserva from '../ReservasCrud/CreateReserva';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReservaList from '../ReservasCrud/ReservasList';

const Index = () => {
    return (
    
    <AuthenticatedLayout>
        <div>
            <CreateReserva />
            <ReservaList />
        </div>  
    </AuthenticatedLayout>
       
    );
};

export default Index;


