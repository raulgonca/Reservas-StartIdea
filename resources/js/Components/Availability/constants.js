/**
 * Estados de disponibilidad
 * @constant
 */
export const AVAILABILITY_STATES = {
    FREE: 'free',
    PARTIAL: 'partial',
    OCCUPIED: 'occupied',
    UNAVAILABLE: 'unavailable'
};

/**
 * Modos de vista
 * @constant
 */
export const VIEW_MODES = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month'
};

/**
 * Días de la semana en español
 * @constant
 */
export const WEEKDAYS = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
];

/**
 * Configuración de horarios
 * @constant
 */
export const TIME_CONFIG = {
    START_HOUR: '08:00',
    END_HOUR: '20:00',
    SLOT_DURATION: 60 // minutos
};

/**
 * Configuración de colores por estado
 * @constant
 */
export const STATUS_COLORS = {
    [AVAILABILITY_STATES.FREE]: {
        bg: 'bg-green-500',
        text: 'text-green-800',
        border: 'border-green-200',
        hover: 'hover:bg-green-50'
    },
    [AVAILABILITY_STATES.PARTIAL]: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-50'
    },
    [AVAILABILITY_STATES.OCCUPIED]: {
        bg: 'bg-red-500',
        text: 'text-red-800',
        border: 'border-red-200',
        hover: 'hover:bg-red-50'
    },
    [AVAILABILITY_STATES.UNAVAILABLE]: {
        bg: 'bg-gray-300',
        text: 'text-gray-800',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-50'
    }
};

/**
 * Textos por estado
 * @constant
 */
export const STATUS_TEXTS = {
    [AVAILABILITY_STATES.FREE]: 'Disponible',
    [AVAILABILITY_STATES.PARTIAL]: 'Parcialmente ocupado',
    [AVAILABILITY_STATES.OCCUPIED]: 'Ocupado',
    [AVAILABILITY_STATES.UNAVAILABLE]: 'No disponible'
};

/**
 * Formato de fecha por tipo de vista
 * @constant
 */
export const DATE_FORMATS = {
    [VIEW_MODES.DAY]: "EEEE d 'de' MMMM, yyyy",
    [VIEW_MODES.WEEK]: "d 'de' MMMM",
    [VIEW_MODES.MONTH]: "MMMM 'de' yyyy"
};