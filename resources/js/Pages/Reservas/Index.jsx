import React from 'react';
import CreateReserva from '../ReservasCrud/CreateReserva';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Index = () => {
    return (
    
    <AuthenticatedLayout>
        <div>
            <CreateReserva />
        </div>  
    </AuthenticatedLayout>
       
    );
};

export default Index;


