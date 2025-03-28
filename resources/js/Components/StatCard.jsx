export default function StatCard({ title, value, icon, color, loading }) {
    return (
        <div className={`p-6 rounded-lg shadow-sm ${color}`}>
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                        </div>
                        <div>{icon}</div>
                    </div>
                </>
            )}
        </div>
    );
}