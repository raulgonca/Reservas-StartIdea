// Importación de hooks de React
import { useState } from 'react';

// Importación de componentes personalizados
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

/**
 * Componente PasswordInput - Campo de contraseña con opción de mostrar/ocultar
 * Este componente puede funcionar de forma autónoma o ser controlado externamente
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual del campo
 * @param {function} props.onChange - Función para manejar cambios en el valor
 * @param {string} props.label - Etiqueta del campo (por defecto "Contraseña")
 * @param {boolean} props.showToggle - Habilita/deshabilita el checkbox individual
 * @param {boolean} props.showPassword - Control externo de visibilidad
 * @param {string} props.error - Mensaje de error a mostrar
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props.props - Propiedades adicionales para el input
 * @returns {JSX.Element} Componente de input de contraseña
 */
export default function PasswordInput({ 
    // Props principales
    value,
    onChange,
    label = "Contraseña",
    
    // Props de control de visibilidad
    showToggle = true,
    showPassword = undefined,
    
    // Props de estilo y error
    error = null,
    className = "",
    
    // Props adicionales para el input
    ...props 
}) {
    // Estado local para controlar la visibilidad cuando no hay control externo
    const [localShowPassword, setLocalShowPassword] = useState(false);

    // Determinar si la contraseña debe ser visible
    // Si hay control externo (showPassword está definido), usar ese valor
    // Si no, usar el estado local
    const isPasswordVisible = showPassword !== undefined ? showPassword : localShowPassword;

    /**
     * Maneja el cambio en el checkbox local de mostrar/ocultar contraseña
     * @param {Event} e - Evento del checkbox
     */
    const handleLocalPasswordToggle = (e) => {
        setLocalShowPassword(e.target.checked);
    };

    return (
        <div className={className}>
            {/* Etiqueta del campo */}
            <InputLabel htmlFor="password" value={label} />

            {/* Campo de contraseña */}
            <TextInput
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full"
                {...props}
            />

            {/* Mensaje de error */}
            <InputError message={error} className="mt-2" />

            {/* Checkbox para mostrar/ocultar contraseña 
                Solo se muestra si:
                1. showToggle es true
                2. No hay control externo (showPassword es undefined)
            */}
            {showToggle && showPassword === undefined && (
                <label className="mt-2 flex items-center">
                    <Checkbox
                        name="showPassword"
                        checked={localShowPassword}
                        onChange={handleLocalPasswordToggle}
                    />
                    <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                        Mostrar contraseña
                    </span>
                </label>
            )}
        </div>
    );
}