import React from 'react';

/**
 * Componente LoadingState - Muestra estados de carga (skeletons) para las diferentes vistas del calendario
 * @param {Object} props
 * @param {string} props.viewMode - Tipo de vista ('day', 'week', 'month')
 * @returns {JSX.Element}
 */
const LoadingState = ({ viewMode = 'day' }) => {
  // Skeleton para vista diaria
  const DaySkeleton = () => (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Encabezado del día */}
        <div className="h-8 bg-gray-200 rounded-md w-2/3 mb-6"></div>
        
        {/* Slots de hora - Repetir para crear efecto de lista */}
        {[...Array(10)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 border-b pb-3">
            <div className="h-6 bg-gray-200 rounded-md w-24"></div>
            <div className="h-6 bg-gray-200 rounded-md w-20"></div>
            <div className="flex-1"></div>
            <div className="h-6 bg-gray-200 rounded-md w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton para vista semanal
  const WeekSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-2">
        {/* Cabecera de días de la semana */}
        {[...Array(7)].map((_, index) => (
          <div key={`header-${index}`} className="flex flex-col items-center">
            <div className="h-5 bg-gray-200 rounded-md w-16 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded-md w-8 mb-4"></div>
          </div>
        ))}
        
        {/* Tarjetas del día */}
        {[...Array(7)].map((_, index) => (
          <div key={`day-${index}`} className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm h-28 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="h-6 bg-gray-200 rounded-md w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton para vista mensual
  const MonthSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-1">
        {/* Nombres de los días de la semana */}
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
          <div key={`header-${index}`} className="text-center py-2 text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Días del mes (6 semanas x 7 días) */}
        {[...Array(42)].map((_, index) => (
          <div 
            key={`day-${index}`} 
            className="h-20 border border-gray-100 p-1 relative bg-white"
          >
            <div className="h-6 w-6 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded-md w-16 mt-4 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar el skeleton correspondiente según el tipo de vista
  switch (viewMode) {
    case 'day':
      return <DaySkeleton />;
    case 'week':
      return <WeekSkeleton />;
    case 'month':
      return <MonthSkeleton />;
    default:
      return <DaySkeleton />;
  }
};

export default LoadingState;