// resources/helpers/validation.js

export const validateName = (name) => {
    if (!name) return 'El nombre es obligatorio.';
    if (typeof name !== 'string') return 'El nombre debe ser una cadena de texto.';
    if (name.length > 255) return 'El nombre no puede tener más de 255 caracteres.';
    return '';
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es obligatorio.';
    if (typeof email !== 'string') return 'El correo electrónico debe ser una cadena de texto.';
    if (email !== email.toLowerCase()) return 'El correo electrónico debe estar en minúsculas.';
    if (!emailRegex.test(email)) return 'El correo electrónico debe ser una dirección válida.';
    if (email.length > 255) return 'El correo electrónico no puede tener más de 255 caracteres.';
    return '';
};

export const validatePassword = (password, passwordConfirmation) => {
    if (!password) return 'La contraseña es obligatoria.';
    if (password !== passwordConfirmation) return 'La confirmación de la contraseña no coincide.';
    // Puedes agregar más reglas de validación aquí según las reglas de Password::defaults()
    return '';
};

export const validatePhone = (phone) => {
    const phoneRegex = /^[6789]\d{8}$/;
    if (!phone) return 'El teléfono es obligatorio.';
    if (typeof phone !== 'string') return 'El teléfono debe ser una cadena de texto.';
    if (phone.length > 15) return 'El teléfono no puede tener más de 15 caracteres.';
    if (!phoneRegex.test(phone)) return 'El teléfono debe tener un formato válido (9 dígitos, empieza con 6, 7, 8 o 9).';
    return '';
};

export const validateDni = (dni) => {
    const dniRegex = /^\d{8}[A-Za-z]$/;
    if (!dni) return 'El DNI es obligatorio.';
    if (typeof dni !== 'string') return 'El DNI debe ser una cadena de texto.';
    if (dni.length > 20) return 'El DNI no puede tener más de 20 caracteres.';
    if (!dniRegex.test(dni)) return 'El DNI debe tener un formato válido (8 dígitos + 1 letra).';
    return '';
};
