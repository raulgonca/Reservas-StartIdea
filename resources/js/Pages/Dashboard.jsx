import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
    ChartBarIcon, 
    CalendarIcon, 
    ClockIcon, 
    UserGroupIcon,
    BuildingOfficeIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    ArcElement,
    Title, 
    Tooltip, 
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    ArcElement,
    Title, 
    Tooltip, 
    Legend,
    Filler
);

export default function Dashboard({ auth }) {
    const [stats, setStats] = useState({
        totalReservas: 0,
        reservasHoy: 0,
        espaciosActivos: 0,
        ocupacion: 0,
        misReservas: 0,
        proximasReservas: 0,
        totalUsuarios: 0,
        bloqueos: 0
    });
    
    const [ultimasReservas, setUltimasReservas] = useState([]);
    const [proximasReservas, setProximasReservas] = useState([]);
    const [chartData, setChartData] = useState({
        reservasPorDia: {},
        ocupacionPorEspacio: {},
        reservasPorMes: {},
        distribucionEspacios: {}
    });
    const [isLoading, setIsLoading] = useState(true);
    
    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'superadmin';
    const isSuperAdmin = auth.user.role === 'superadmin';
    
    useEffect(() => {
        // Simulamos la carga de datos mientras se implementan las APIs
        const loadDemoData = () => {
            setTimeout(() => {
                if (isAdmin) {
                    setStats({
                        totalReservas: 145,
                        reservasHoy: 12,
                        espaciosActivos: 8,
                        ocupacion: 65,
                        totalUsuarios: isSuperAdmin ? 42 : 0,
                        bloqueos: isSuperAdmin ? 3 : 0
                    });
                    setUltimasReservas([
                        { id: 1, usuario: "Carlos Pérez", espacio: "Sala Reuniones A", fecha: "2025-03-17", hora: "10:00" },
                        { id: 2, usuario: "María López", espacio: "Escritorio 5", fecha: "2025-03-17", hora: "11:30" },
                        { id: 3, usuario: "Juan Gómez", espacio: "Sala Conferencias", fecha: "2025-03-18", hora: "09:00" },
                    ]);
                    
                    // Datos para gráficas de administradores
                    setChartData({
                        reservasPorDia: {
                            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                            datasets: [
                                {
                                    label: 'Reservas esta semana',
                                    data: [12, 19, 15, 8, 22],
                                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                    borderColor: 'rgb(54, 162, 235)',
                                    borderWidth: 1
                                }
                            ]
                        },
                        ocupacionPorEspacio: {
                            labels: ['Sala A', 'Sala B', 'Escritorios', 'Sala Conferencias', 'Exterior'],
                            datasets: [
                                {
                                    data: [65, 80, 45, 90, 35],
                                    backgroundColor: [
                                        'rgba(54, 162, 235, 0.7)',
                                        'rgba(75, 192, 192, 0.7)',
                                        'rgba(255, 206, 86, 0.7)',
                                        'rgba(153, 102, 255, 0.7)',
                                        'rgba(255, 99, 132, 0.7)',
                                    ],
                                    borderWidth: 1
                                }
                            ]
                        },
                        tendenciaReservas: {
                            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                            datasets: [
                                {
                                    label: 'Reservas 2025',
                                    data: [65, 78, 90, 85, 110, 145],
                                    borderColor: 'rgb(75, 192, 192)',
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    tension: 0.3,
                                    fill: true
                                },
                                {
                                    label: 'Reservas 2024',
                                    data: [55, 60, 72, 68, 90, 120],
                                    borderColor: 'rgb(153, 102, 255)',
                                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                    tension: 0.3,
                                    fill: true
                                }
                            ]
                        }
                    });
                } else {
                    setStats({
                        misReservas: 8,
                        proximasReservas: 2,
                        espaciosActivos: 8,
                        ocupacion: 65
                    });
                    setUltimasReservas([
                        { id: 1, espacio: "Sala Reuniones A", fecha: "2025-03-10", hora: "14:00", estado: "Completada" },
                        { id: 2, espacio: "Escritorio 3", fecha: "2025-03-15", hora: "09:30", estado: "Completada" },
                    ]);
                    setProximasReservas([
                        { id: 3, espacio: "Sala Conferencias", fecha: "2025-03-20", hora: "11:00", estado: "Confirmada" },
                        { id: 4, espacio: "Escritorio 7", fecha: "2025-03-22", hora: "10:00", estado: "Pendiente" },
                    ]);
                    
                    // Datos para gráficas de usuarios normales
                    setChartData({
                        reservasPorMes: {
                            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                            datasets: [
                                {
                                    label: 'Mis reservas',
                                    data: [2, 1, 3, 0, 2, 3],
                                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                    borderColor: 'rgb(75, 192, 192)',
                                    borderWidth: 1
                                }
                            ]
                        },
                        distribucionEspacios: {
                            labels: ['Salas de Reuniones', 'Escritorios', 'Sala Conferencias', 'Exterior'],
                            datasets: [
                                {
                                    data: [4, 3, 1, 0],
                                    backgroundColor: [
                                        'rgba(54, 162, 235, 0.7)',
                                        'rgba(75, 192, 192, 0.7)',
                                        'rgba(255, 206, 86, 0.7)',
                                        'rgba(255, 99, 132, 0.7)',
                                    ],
                                    borderWidth: 1
                                }
                            ]
                        }
                    });
                }
                setIsLoading(false);
            }, 800); // Simula un tiempo de carga para mostrar el estado de carga
        };

        loadDemoData();
    }, [isAdmin, isSuperAdmin]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false
            },
        },
    };
    
    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {isAdmin ? "Panel de Administración" : "Mi Dashboard"}
                </h1>
            }
        >
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Cards - Diferentes para cada rol */}
                    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                        {isAdmin ? (
                            // Cards para admin/superadmin
                            <>
                                <StatCard 
                                    title="Total Reservas"
                                    value={stats.totalReservas}
                                    icon={<CalendarIcon className="w-8 h-8 text-blue-500" />}
                                    color="bg-blue-100 dark:bg-blue-900"
                                    loading={isLoading}
                                />
                                <StatCard 
                                    title="Reservas de Hoy"
                                    value={stats.reservasHoy}
                                    icon={<ClockIcon className="w-8 h-8 text-green-500" />}
                                    color="bg-green-100 dark:bg-green-900"
                                    loading={isLoading}
                                />
                                <StatCard 
                                    title="Espacios Activos"
                                    value={stats.espaciosActivos}
                                    icon={<BuildingOfficeIcon className="w-8 h-8 text-purple-500" />}
                                    color="bg-purple-100 dark:bg-purple-900"
                                    loading={isLoading}
                                />
                                <StatCard 
                                    title="% Ocupación"
                                    value={`${stats.ocupacion}%`}
                                    icon={<ChartBarIcon className="w-8 h-8 text-amber-500" />}
                                    color="bg-amber-100 dark:bg-amber-900"
                                    loading={isLoading}
                                />
                                {isSuperAdmin && (
                                    <>
                                        <StatCard 
                                            title="Total Usuarios"
                                            value={stats.totalUsuarios}
                                            icon={<UserGroupIcon className="w-8 h-8 text-indigo-500" />}
                                            color="bg-indigo-100 dark:bg-indigo-900"
                                            loading={isLoading}
                                        />
                                        <StatCard 
                                            title="Bloqueos Activos"
                                            value={stats.bloqueos}
                                            icon={<ShieldCheckIcon className="w-8 h-8 text-red-500" />}
                                            color="bg-red-100 dark:bg-red-900"
                                            loading={isLoading}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            // Cards para usuarios normales
                            <>
                                <StatCard 
                                    title="Mis Reservas"
                                    value={stats.misReservas}
                                    icon={<CalendarIcon className="w-8 h-8 text-blue-500" />}
                                    color="bg-blue-100 dark:bg-blue-900"
                                    loading={isLoading}
                                />
                                <StatCard 
                                    title="Próximas Reservas"
                                    value={stats.proximasReservas}
                                    icon={<ClockIcon className="w-8 h-8 text-green-500" />}
                                    color="bg-green-100 dark:bg-green-900"
                                    loading={isLoading}
                                />
                                <StatCard 
                                    title="Espacios Disponibles"
                                    value={stats.espaciosActivos}
                                    icon={<BuildingOfficeIcon className="w-8 h-8 text-purple-500" />}
                                    color="bg-purple-100 dark:bg-purple-900"
                                    loading={isLoading}
                                />
                                <StatCard 
                                    title="% Ocupación"
                                    value={`${stats.ocupacion}%`}
                                    icon={<ChartBarIcon className="w-8 h-8 text-amber-500" />}
                                    color="bg-amber-100 dark:bg-amber-900"
                                    loading={isLoading}
                                />
                            </>
                        )}
                    </div>
                    
                    {/* Gráficos - Diferentes según el rol */}
                    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                        {isAdmin ? (
                            // Gráficos para administradores
                            <>
                                <ChartCard 
                                    title="Reservas por Día (Esta semana)" 
                                    loading={isLoading}
                                >
                                    {!isLoading && <Bar data={chartData.reservasPorDia} options={chartOptions} height={240} />}
                                </ChartCard>
                                
                                <ChartCard 
                                    title="% Ocupación por Espacio" 
                                    loading={isLoading}
                                >
                                    {!isLoading && <Doughnut data={chartData.ocupacionPorEspacio} options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                ...chartOptions.plugins.legend,
                                                position: 'right'
                                            }
                                        }
                                    }} height={240} />}
                                </ChartCard>
                                
                                <ChartCard 
                                    title="Tendencia de Reservas" 
                                    loading={isLoading}
                                    className="lg:col-span-2"
                                >
                                    {!isLoading && <Line data={chartData.tendenciaReservas} options={chartOptions} height={150} />}
                                </ChartCard>
                            </>
                        ) : (
                            // Gráficos para usuarios normales
                            <>
                                <ChartCard 
                                    title="Mis Reservas por Mes" 
                                    loading={isLoading}
                                >
                                    {!isLoading && <Bar data={chartData.reservasPorMes} options={chartOptions} height={240} />}
                                </ChartCard>
                                
                                <ChartCard 
                                    title="Distribución por Tipo de Espacio" 
                                    loading={isLoading}
                                >
                                    {!isLoading && <Pie data={chartData.distribucionEspacios} options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                ...chartOptions.plugins.legend,
                                                position: 'right'
                                            }
                                        }
                                    }} height={240} />}
                                </ChartCard>
                            </>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Panel principal - Diferente para cada rol */}
                        <div className="col-span-2 overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {isAdmin ? "Últimas Reservas" : "Mi Historial de Reservas"}
                                </h2>
                                <Link href={isAdmin ? "/reservas" : "/mis-reservas"} 
                                      className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                                    Ver todas
                                </Link>
                            </div>
                            <div className="p-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                                                    {isAdmin && <th className="px-4 py-3">Usuario</th>}
                                                    <th className="px-4 py-3">Espacio</th>
                                                    <th className="px-4 py-3">Fecha</th>
                                                    <th className="px-4 py-3">Hora</th>
                                                    {!isAdmin && <th className="px-4 py-3">Estado</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                {ultimasReservas.map((reserva) => (
                                                    <tr key={reserva.id} className="text-gray-700 dark:text-gray-300">
                                                        {isAdmin && <td className="px-4 py-3">{reserva.usuario}</td>}
                                                        <td className="px-4 py-3">{reserva.espacio}</td>
                                                        <td className="px-4 py-3">{reserva.fecha}</td>
                                                        <td className="px-4 py-3">{reserva.hora}</td>
                                                        {!isAdmin && <td className="px-4 py-3">{reserva.estado}</td>}
                                                    </tr>
                                                ))}
                                                {ultimasReservas.length === 0 && (
                                                    <tr className="text-gray-700 dark:text-gray-300">
                                                        <td colSpan={isAdmin ? 4 : 4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                            No hay reservas para mostrar
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Panel lateral derecho - Diferente para cada rol */}
                        <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                            {isAdmin ? (
                                // Panel para admin/superadmin
                                <>
                                    <div className="px-6 py-4 border-b dark:border-gray-700">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Administración
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <QuickActionButton 
                                                title="Nueva Reserva"
                                                href="/reservas/create"
                                                color="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                            />
                                            <QuickActionButton 
                                                title="Gestionar Espacios"
                                                href="/espacios"
                                                color="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                            />
                                            <QuickActionButton 
                                                title="Crear Bloqueo"
                                                href="/bloqueos/create"
                                                color="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                                            />
                                            <QuickActionButton 
                                                title="Ver Reportes"
                                                href="/reportes"
                                                color="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                                            />
                                            {isSuperAdmin && (
                                                <>
                                                    <QuickActionButton 
                                                        title="Gestionar Usuarios"
                                                        href="/usuarios"
                                                        color="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                                                    />
                                                    <QuickActionButton 
                                                        title="Configuración"
                                                        href="/configuracion"
                                                        color="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Panel para usuarios normales
                                <>
                                    <div className="px-6 py-4 border-b dark:border-gray-700">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Próximas Reservas
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center h-40">
                                                <div className="w-6 h-6 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                            </div>
                                        ) : proximasReservas.length > 0 ? (
                                            <div className="space-y-4">
                                                {proximasReservas.map((reserva) => (
                                                    <div key={reserva.id} className="p-4 transition-colors border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-700 dark:text-gray-300">{reserva.espacio}</span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                reserva.estado === 'Confirmada' 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            }`}>
                                                                {reserva.estado}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            {reserva.fecha} a las {reserva.hora}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                                                <CalendarIcon className="w-10 h-10 mb-2" />
                                                <p>No tienes reservas próximas</p>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <QuickActionButton 
                                                title="Nueva Reserva"
                                                href="/reservas/create"
                                                color="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                            />
                                            <QuickActionButton 
                                                title="Ver Disponibilidad"
                                                href="/disponibilidad"
                                                color="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Componentes auxiliares
function StatCard({ title, value, icon, color, loading }) {
    return (
        <div className={`p-4 rounded-lg shadow ${color}`}>
            <div className="flex items-center">
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-1 ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                        {title}
                    </p>
                    {loading ? (
                        <div className="w-12 h-6 mt-1 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                    ) : (
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {value}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, children, loading, className = '' }) {
    return (
        <div className={`overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}>
            <div className="px-6 py-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h2>
            </div>
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-[240px]">
                        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="h-full">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

function QuickActionButton({ title, href, color }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-center px-4 py-2 font-medium text-white rounded-lg ${color}`}
        >
            {title}
        </Link>
    );
}