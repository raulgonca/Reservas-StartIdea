import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ChartBarIcon, CalendarIcon, ClockIcon, UserGroupIcon, BuildingOfficeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import StatCard from '@/Components/StatCard';
import ChartCard from '@/Components/ChartCard';

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

    // Asegurarse de que chartData tenga una estructura válida con valores predeterminados
    const [chartData, setChartData] = useState({
        reservasPorDia: { labels: [], datasets: [] },
        ocupacionPorEspacio: { labels: [], datasets: [] },
        reservasPorMes: { labels: [], datasets: [] },
        distribucionEspacios: { labels: [], datasets: [] },
        tendenciaReservas: { labels: [], datasets: [] },
        ...(initialChartData || {})
    });

    const [ultimasReservas, setUltimasReservas] = useState(initialStats?.ultimasReservas || []);
    const [proximasReservasState, setProximasReservasState] = useState(initialProximasReservas || []);
    const [isLoading, setIsLoading] = useState(!initialStats || !initialChartData);
    const [historialReservasState, setHistorialReservasState] = useState(historialReservas || []);

    useEffect(() => {
        console.log("initialChartData:", initialChartData);  // Ver los datos que llegan
        console.log("chartData:", chartData);  // Ver los datos del estado
        console.log("Stats recibidos:", initialStats);
        console.log("Próximas reservas:", initialProximasReservas);
        console.log("Historial reservas:", historialReservas);

        if (initialStats && initialChartData) {
            setStats(initialStats);
            // Asegurarse de que cada propiedad de chartData tenga una estructura válida
            const safeChartData = {
                reservasPorDia: initialChartData.reservasPorDia || { labels: [], datasets: [] },
                ocupacionPorEspacio: initialChartData.ocupacionPorEspacio || { labels: [], datasets: [] },
                reservasPorMes: initialChartData.reservasPorMes || { labels: [], datasets: [] },
                distribucionEspacios: initialChartData.distribucionEspacios || { labels: [], datasets: [] },
                tendenciaReservas: initialChartData.tendenciaReservas || { labels: [], datasets: [] }
            };
            setChartData(safeChartData);
            setProximasReservasState(initialProximasReservas || []);
            setHistorialReservasState(historialReservas || []);
            setIsLoading(false);
        }
    }, [initialStats, initialChartData, initialProximasReservas, historialReservas]);

    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'superadmin';
    const isSuperAdmin = auth.user.role === 'superadmin';

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
                        {!isAdmin && (
                            <>
                                <ChartCard title="Mis Reservas por Mes" loading={isLoading}>
                                    {!isLoading && chartData.reservasPorMes && chartData.reservasPorMes.labels && (
                                        <Bar data={chartData.reservasPorMes} options={chartOptions} height={240} />
                                    )}
                                </ChartCard>
                                <ChartCard title="Distribución por Tipo de Espacio" loading={isLoading}>
                                    {!isLoading && chartData.distribucionEspacios && chartData.distribucionEspacios.labels && (
                                        <Pie data={chartData.distribucionEspacios} options={{
                                            ...chartOptions,
                                            plugins: {
                                                ...chartOptions.plugins,
                                                legend: { position: 'right' }
                                            }
                                        }} height={240} />
                                    )}
                                </ChartCard>
                            </>
                        )}

                        {/* Additional Charts for Admins */}
                        {isAdmin && (
                            <ChartCard title="Tendencia de Reservas" loading={isLoading} className="lg:col-span-2">
                                {!isLoading && chartData.tendenciaReservas && chartData.tendenciaReservas.labels && (
                                    <Line data={chartData.tendenciaReservas} options={chartOptions} height={150} />
                                )}
                            </ChartCard>
                        )}
                    </div>

                    {/* Reservations and Occupation Section for Admins */}
                    {isAdmin && (
                        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                            {/* Ocupación por Espacio */}
                            <ChartCard title="Ocupación por Espacio" loading={isLoading}>
                                {!isLoading && chartData.ocupacionPorEspacio && chartData.ocupacionPorEspacio.labels && (
                                    <Doughnut data={chartData.ocupacionPorEspacio} options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: { position: 'right' }
                                        }
                                    }} height={240} />
                                )}
                            </ChartCard>

                            {/* Próximas Reservas */}
                            <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Próximas Reservas
                                </h3>
                                <div className="overflow-hidden">
                                    {!proximasReservasState || proximasReservasState.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No hay próximas reservas</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Espacio</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                                    {proximasReservasState.slice(0, 5).map((reserva) => (
                                                        <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100">{reserva.espacio?.nombre || 'N/A'}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100">{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                                                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                }`}>
                                                                    {reserva.estado?.charAt(0).toUpperCase() + reserva.estado?.slice(1) || 'N/A'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reservations Lists Section - Only show for non-admins or show historial for admins */}
                    <div className="grid grid-cols-1 gap-6 mt-8">
                        {!isAdmin && (
                            /* Próximas Reservas - Only for non-admins */
                            <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Próximas Reservas
                                </h3>
                                <div className="overflow-hidden">
                                    {!proximasReservasState || proximasReservasState.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No hay próximas reservas</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Espacio</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                                    {proximasReservasState.map((reserva) => (
                                                        <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100">{reserva.espacio?.nombre || 'N/A'}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100">{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                                                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                }`}>
                                                                    {reserva.estado?.charAt(0).toUpperCase() + reserva.estado?.slice(1) || 'N/A'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Historial de Reservas - For all users */}
                        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Historial de Reservas
                            </h3>
                            <div className="overflow-hidden">
                                {!historialReservasState || historialReservasState.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No hay historial de reservas</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Espacio</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                                {historialReservasState.map((reserva) => (
                                                    <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100">{reserva.espacio?.nombre || 'N/A'}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100">{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                reserva.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                                                reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                            }`}>
                                                                {reserva.estado?.charAt(0).toUpperCase() + reserva.estado?.slice(1) || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
