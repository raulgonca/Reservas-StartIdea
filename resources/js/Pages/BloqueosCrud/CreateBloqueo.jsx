import React from 'react';
import BloqueoForm from './BloqueoForm';

export default function CreateBloqueo({ espacios, escritorios }) {
    return (
        <BloqueoForm 
            espacios={espacios} 
            escritorios={escritorios} 
            mode="create" 
        />
    );
}