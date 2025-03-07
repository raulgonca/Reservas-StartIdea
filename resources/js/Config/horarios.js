/**
 * Configuración centralizada de horarios para el sistema de reservas
 * Estos valores deben coincidir con los definidos en config/reservas.php
 */

// Horario operativo
export const HORA_INICIO = '08:00';
export const HORA_FIN = '22:00';

// Lista completa de horas disponibles para selección en formularios
export const HORAS_DISPONIBLES = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
    '20:00', '21:00', '22:00'
];

// Configuración para medio día
export const MEDIO_DIA = {
    MAÑANA: { inicio: '08:00', fin: '14:00', label: 'Mañana (08:00 - 14:00)' },
    TARDE: { inicio: '14:00', fin: '20:00', label: 'Tarde (14:00 - 20:00)' }
};

// Configuración para día completo, semana y mes
export const DIA_COMPLETO = { inicio: '08:00', fin: '22:00' };

/**
 * Obtener lista de horas formateadas para los selectores
 * @returns {Array<Object>} Lista de objetos {value, label} para usar en selectores
 */
export function getHorasSelect() {
    return HORAS_DISPONIBLES.map(hora => ({
        value: hora,
        label: hora
    }));
}

/**
 * Obtener opciones de medio día para selectores
 * @returns {Array<Object>} Lista de objetos con la configuración de medio día
 */
export function getOpcionesMedioDia() {
    return [
        MEDIO_DIA.MAÑANA,
        MEDIO_DIA.TARDE
    ];
}

/**
 * Verificar si una hora está dentro del rango permitido
 * @param {string} hora - Hora en formato HH:MM
 * @returns {boolean} True si la hora está dentro del rango permitido
 */
export function esHoraValida(hora) {
    return HORAS_DISPONIBLES.includes(hora);
}

/**
 * Verificar si un rango de horas está dentro del horario permitido
 * @param {string} horaInicio - Hora de inicio en formato HH:MM
 * @param {string} horaFin - Hora de fin en formato HH:MM
 * @returns {boolean} True si el rango está dentro del horario permitido
 */
export function esRangoHorarioValido(horaInicio, horaFin) {
    const indiceInicio = HORAS_DISPONIBLES.indexOf(horaInicio);
    const indiceFin = HORAS_DISPONIBLES.indexOf(horaFin);
    
    return indiceInicio !== -1 && 
           indiceFin !== -1 && 
           indiceInicio < indiceFin;
}