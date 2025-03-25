import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChartBarIcon,CalendarIcon,ClockIcon,UserGroupIcon,BuildingOfficeIcon,ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,BarElement,ArcElement,Title,Tooltip,Legend,Filler } from 'chart.js';
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

export default function Dashboard({ auth, stats: initialStats, chartData: initialChartData, proximasReservas: initialProximasReservas, historialReservas }) {
    const [stats, setStats] = useState(initialStats || {
        totalReservas: 0,
        reservasHoy: 0,
        espaciosActivos: 0,
        ocupacion: 0,
        misReservas: 0,
        proximasReservas: 0,
        totalUsuarios: 0,
        bloqueos: 0
    });

    const [chartData, setChartData] = useState(initialChartData || {
        reservasPorDia: {
            labels: [],
            datasets: []
        },
        ocupacionPorEspacio: {
            labels: [],
            datasets: []
        },
        reservasPorMes: {
            labels: [],
            datasets: []
        },
        distribucionEspacios: {
            labels: [],
            datasets: []
        },
        tendenciaReservas: {
            labels: [],
            datasets: []
        }
    });

    const [ultimasReservas, setUltimasReservas] = useState(initialStats?.ultimasReservas || []);
    const [proximasReservasState, setProximasReservasState] = useState(initialProximasReservas || []); // Cambiado el nombre
    const [isLoading, setIsLoading] = useState(!initialStats || !initialChartData);

    useEffect(() => {
        if (initialStats && initialChartData) {
            setStats(initialStats);
            setChartData(initialChartData);
            setProximasReservasState(initialProximasReservas); // Actualizado
            setHistorialReservasState(historialReservas);
            setIsLoading(false);
        }
    }, [initialStats, initialChartData, initialProximasReservas, historialReservas]);

    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'superadmin';
    const isSuperAdmin = auth.user.role === 'superadmin';

    // Agregar este estado para el historial
    const [historialReservasState, setHistorialReservasState] = useState(historialReservas || []);

    useEffect(() => {
        if (initialStats && initialChartData) {
            setStats(initialStats);
            setChartData(initialChartData);
            setHistorialReservasState(historialReservas);
            setIsLoading(false);
        }
    }, [initialStats, initialChartData, historialReservas]);

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
                    {/* Base Stats Cards (Common for all users) */}
                    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
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
                        
                        {/* Additional Stats for Admins */}
                        {isAdmin && (
                            <>
                                <StatCard
                                    title="Total Reservas"
                                    value={stats.totalReservas}
                                    icon={<CalendarIcon className="w-8 h-8 text-indigo-500" />}
                                    color="bg-indigo-100 dark:bg-indigo-900"
                                    loading={isLoading}
                                />
                                <StatCard
                                    title="Reservas de Hoy"
                                    value={stats.reservasHoy}
                                    icon={<ClockIcon className="w-8 h-8 text-pink-500" />}
                                    color="bg-pink-100 dark:bg-pink-900"
                                    loading={isLoading}
                                />
                                {isSuperAdmin && (
                                    <>
                                        <StatCard
                                            title="Total Usuarios"
                                            value={stats.totalUsuarios}
                                            icon={<UserGroupIcon className="w-8 h-8 text-cyan-500" />}
                                            color="bg-cyan-100 dark:bg-cyan-900"
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
                        )}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                        <ChartCard title="Mis Reservas por Mes" loading={isLoading}>
                            {!isLoading && <Bar data={chartData.reservasPorMes} options={chartOptions} height={240} />}
                        </ChartCard>
                        <ChartCard title="Distribución por Tipo de Espacio" loading={isLoading}>
                            {!isLoading && <Pie data={chartData.distribucionEspacios} options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    legend: { position: 'right' }
                                }
                            }} height={240} />}
                        </ChartCard>

                        {/* Additional Charts for Admins */}
                        {isAdmin && (
                            <>
                                <ChartCard title="Tendencia de Reservas" loading={isLoading} className="lg:col-span-2">
                                    {!isLoading && <Line data={chartData.tendenciaReservas} options={chartOptions} height={150} />}
                                </ChartCard>
                                <ChartCard title="Ocupación por Espacio" loading={isLoading}>
                                    {!isLoading && <Doughnut data={chartData.ocupacionPorEspacio} options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: { position: 'right' }
                                        }
                                    }} height={240} />}
                                </ChartCard>
                            </>
                        )}
                    </div>

                    {/* Reservations Lists Section */}
                    <div className="grid grid-cols-1 gap-6 mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Próximas Reservas */}
                            <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Próximas Reservas
                                </h3>
                                <div className="overflow-hidden">
                                    {!proximasReservasState || proximasReservasState.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No hay próximas reservas</p>
                                    ) : (
                                        <table className="min-w-full">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Fecha</th>
                                                    <th className="px-4 py-2 text-left">Espacio</th>
                                                    <th className="px-4 py-2 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {proximasReservasState?.map((reserva) => (
                                                    <tr key={reserva.id} className="border-b">
                                                        <td className="px-4 py-2">{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">
                                                            {reserva.espacio}
                                                            {reserva.escritorio && ` (Escritorio ${reserva.escritorio})`}
                                                        </td>
                                                        <td className="px-4 py-2">{reserva.estado}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Historial de Reservas */}
                            <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 lg:col-span-2">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Historial de Reservas
                                </h3>
                                <div className="overflow-hidden">
                                    {!historialReservasState || historialReservasState.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No hay registros en el historial</p>
                                    ) : (
                                        <table className="min-w-full">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Fecha</th>
                                                    <th className="px-4 py-2 text-left">Horario</th>
                                                    <th className="px-4 py-2 text-left">Espacio</th>
                                                    <th className="px-4 py-2 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historialReservasState.map((reserva) => (
                                                    <tr key={reserva.id} className="border-b">
                                                        <td className="px-4 py-2">{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">{`${reserva.hora_inicio} - ${reserva.hora_fin}`}</td>
                                                        <td className="px-4 py-2">
                                                            {reserva.espacio}
                                                            {reserva.escritorio && ` (Escritorio ${reserva.escritorio})`}
                                                        </td>
                                                        <td className="px-4 py-2">{reserva.estado}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
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