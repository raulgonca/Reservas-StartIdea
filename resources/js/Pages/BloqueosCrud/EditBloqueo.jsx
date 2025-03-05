import React from 'react';
import BloqueoForm from './BloqueoForm';

export default function EditBloqueo({ bloqueo, espacios, escritorios }) {
    return (
        <BloqueoForm 
            bloqueo={bloqueo} 
            espacios={espacios} 
            escritorios={escritorios} 
            mode="edit" 
        />
    );
}