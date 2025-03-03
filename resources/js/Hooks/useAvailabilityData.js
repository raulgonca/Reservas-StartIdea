import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Hook personalizado para gestionar datos de disponibilidad
 * 
 * @param {number|string} espacioId - ID del espacio para el cual consultar disponibilidad
 * @param {Object} options - Opciones de configuración
 * @param {Date|string} [options.initialDate=new Date()] - Fecha inicial seleccionada
 * @param {string} [options.initialView='day'] - Vista inicial (day, week, month)
 * @param {string} [options.tipoEspacio='common'] - Tipo de espacio ('coworking' o 'common')
 * @param {boolean} [options.useCache=true] - Si debe usar caché para evitar peticiones repetidas
 * @returns {Object} Estado y funciones para gestionar la disponibilidad
 */
export const useAvailabilityData = (espacioId, options = {}) => {
  // Valores iniciales con defaults
  const { 
    initialDate = new Date(), 
    initialView = 'day',
    tipoEspacio = 'common', // Parámetro para tipo de espacio
    useCache = true // Parámetro para habilitar/deshabilitar caché
  } = options;
  
  // Estados principales
  const [selectedDate, setSelectedDate] = useState(
    initialDate instanceof Date ? initialDate : new Date(initialDate)
  );
  const [viewMode, setViewMode] = useState(initialView);
  const [data, setData] = useState({
    escritorios: [],
    slots: [],
    weekData: {},
    monthData: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Referencia para cancelar peticiones anteriores
  const cancelTokenRef = useRef(null);
  
  // Cache para almacenar respuestas previas
  const cacheRef = useRef({});
  
  // Clave para identificar peticiones en caché
  const getCacheKey = useCallback((date, view) => {
    return `${espacioId}_${format(date, 'yyyy-MM-dd')}_${view}_${tipoEspacio}`;
  }, [espacioId, tipoEspacio]);

  /**
   * Formatea la fecha para la API
   * @param {Date} date - Fecha a formatear
   * @returns {string} - Fecha formateada YYYY-MM-DD
   */
  const formatDateForAPI = useCallback((date) => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  /**
   * Limpia la caché almacenada
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  /**
   * Procesa los datos según el tipo de espacio y vista
   * @param {Object} responseData - Datos recibidos de la API
   * @returns {Object} - Datos procesados en formato unificado
   */
  const processDataByTipoEspacio = useCallback((responseData) => {
    // Log para debugging
    console.log('Raw API response:', responseData);
    
    // Si no hay datos, devolver estructura base
    if (!responseData) return {
      escritorios: [],
      slots: [],
      weekData: {},
      monthData: {}
    };
    
    // Inicializar objeto de datos procesados con valores predeterminados
    const processedData = {
      escritorios: [],
      slots: [],
      weekData: {},
      monthData: {}
    };
    
    // Procesamiento específico según la vista actual
    switch (viewMode) {
      case 'day':
        // Para la vista diaria - Según el backend, siempre recibimos un array de "escritorios"
        if (responseData.escritorios && Array.isArray(responseData.escritorios)) {
          // Guardar los escritorios tal como vienen
          processedData.escritorios = responseData.escritorios;
          
          // Para espacios no-coworking, extraer los slots del primer escritorio para usarlos directamente
          // Esto facilita que los componentes puedan trabajar con la misma estructura 
          if (tipoEspacio !== 'coworking' && responseData.escritorios.length > 0) {
            const primerEscritorio = responseData.escritorios[0];
            if (primerEscritorio.slots && Array.isArray(primerEscritorio.slots)) {
              processedData.slots = primerEscritorio.slots;
            }
          }
        }
        break;
        
      case 'week':
        // Para vista semanal
        if (responseData.weekData) {
          processedData.weekData = responseData.weekData;
        }
        break;
        
      case 'month':
        // Para vista mensual
        if (responseData.monthData) {
          processedData.monthData = responseData.monthData;
        }
        
        // Para espacios coworking, también se devuelven los escritorios
        if (responseData.escritorios && Array.isArray(responseData.escritorios)) {
          processedData.escritorios = responseData.escritorios;
        }
        break;
    }
    
    // Log de datos procesados para debugging
    console.log('Processed data:', processedData);
    
    return processedData;
  }, [viewMode, tipoEspacio]);

  /**
   * Función principal para cargar datos de disponibilidad
   */
  const fetchData = useCallback(async () => {
    if (!espacioId) return;
    
    // Cancelar petición anterior si existe
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Nueva petición iniciada');
    }
    
    // Crear nuevo token de cancelación
    cancelTokenRef.current = axios.CancelToken.source();
    
    setLoading(true);
    setError(null);
    
    const formattedDate = formatDateForAPI(selectedDate);
    const cacheKey = getCacheKey(selectedDate, viewMode);
    
    // Verificar si tenemos los datos en caché
    if (useCache && cacheRef.current[cacheKey]) {
      setData(cacheRef.current[cacheKey]);
      setLoading(false);
      return;
    }
    
    try {
      // Usar un endpoint unificado para todos los tipos de espacio
      const endpoint = `/v1/espacios/${espacioId}/availability`;
      
      console.log('Fetching availability data:', {
        endpoint,
        fecha: formattedDate,
        vista: viewMode,
        tipo_espacio: tipoEspacio
      });
      
      const response = await axios.get(endpoint, {
        params: {
          fecha: formattedDate,
          vista: viewMode,
          tipo_espacio: tipoEspacio // Añadir el tipo de espacio como parámetro
        },
        cancelToken: cancelTokenRef.current.token
      });
      
      // Validar la respuesta del servidor
      if (response.data && typeof response.data === 'object') {
        // Procesar datos según tipo de espacio y vista
        const processedData = processDataByTipoEspacio(response.data);
        
        // Guardar en caché si está habilitado
        if (useCache) {
          cacheRef.current[cacheKey] = processedData;
        }
        
        setData(processedData);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      // Ignorar errores de cancelación
      if (axios.isCancel(err)) {
        console.log('Petición cancelada:', err.message);
        return;
      }
      
      console.error('Error al cargar disponibilidad:', err);
      console.error('URL de la petición:', err.config?.url);
      console.error('Parámetros:', err.config?.params);
      
      setError('Error al cargar los datos de disponibilidad');
    } finally {
      setLoading(false);
    }
  }, [espacioId, selectedDate, viewMode, formatDateForAPI, getCacheKey, useCache, tipoEspacio, processDataByTipoEspacio]);

  // Cargar datos cuando cambie la fecha, vista o el ID del espacio
  useEffect(() => {
    fetchData();
    
    // Limpieza: cancelar peticiones pendientes al desmontar
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Componente desmontado');
      }
    };
  }, [fetchData]);

  /**
   * Navegar a una fecha específica
   * @param {Date|string} date - Nueva fecha a seleccionar
   */
  const navigateToDate = useCallback((date) => {
    setSelectedDate(date instanceof Date ? date : new Date(date));
  }, []);

  /**
   * Cambiar el modo de visualización
   * @param {string} mode - Modo de vista (day, week, month)
   */
  const changeViewMode = useCallback((mode) => {
    if (['day', 'week', 'month'].includes(mode)) {
      setViewMode(mode);
    } else {
      console.warn(`Modo de vista no válido: ${mode}. Usar 'day', 'week', o 'month'`);
    }
  }, []);

  /**
   * Avanzar al siguiente día/semana/mes según la vista actual
   */
  const navigateNext = useCallback(() => {
    setSelectedDate(prevDate => {
      switch (viewMode) {
        case 'day':
          return addDays(prevDate, 1);
        case 'week':
          return addWeeks(prevDate, 1);
        case 'month':
          return addMonths(prevDate, 1);
        default:
          return prevDate;
      }
    });
  }, [viewMode]);

  /**
   * Retroceder al día/semana/mes anterior según la vista actual
   */
  const navigatePrevious = useCallback(() => {
    setSelectedDate(prevDate => {
      switch (viewMode) {
        case 'day':
          return subDays(prevDate, 1);
        case 'week':
          return subWeeks(prevDate, 1);
        case 'month':
          return subMonths(prevDate, 1);
        default:
          return prevDate;
      }
    });
  }, [viewMode]);

  /**
   * Ir a la fecha de hoy
   */
  const navigateToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  /**
   * Cambiar fecha y vista al mismo tiempo
   * @param {Date|string} date - Nueva fecha
   * @param {string} view - Nuevo modo de vista
   */
  const goToDateWithView = useCallback((date, view) => {
    setSelectedDate(date instanceof Date ? date : new Date(date));
    if (['day', 'week', 'month'].includes(view)) {
      setViewMode(view);
    }
  }, []);

  /**
   * Refrescar los datos de disponibilidad manualmente
   * @param {boolean} bypassCache - Si debe ignorar la caché
   */
  const refreshData = useCallback((bypassCache = true) => {
    // Si bypass está activado, eliminamos la entrada de caché actual
    if (bypassCache) {
      const cacheKey = getCacheKey(selectedDate, viewMode);
      if (cacheRef.current[cacheKey]) {
        delete cacheRef.current[cacheKey];
      }
    }
    
    fetchData();
  }, [fetchData, getCacheKey, selectedDate, viewMode]);

  // Datos formateados para la interfaz de usuario
  const formattedDate = format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es });
  
  // Devolver todos los estados y funciones necesarios
  return {
    // Estados
    selectedDate,
    viewMode,
    data,
    loading,
    error,
    formattedDate,
    tipoEspacio,
    
    // Métodos para manipular estados
    setSelectedDate: navigateToDate,
    setViewMode: changeViewMode,
    navigateNext,
    navigatePrevious,
    navigateToToday,
    goToDateWithView,
    refreshData,
    clearCache
  };
};

export default useAvailabilityData;