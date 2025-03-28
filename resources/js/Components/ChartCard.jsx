export default function ChartCard({ title, children, loading, className = '' }) {
    return (
        <div className={`p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 ${className}`}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
            </h3>
            <div className="h-[240px] relative">
                {loading ? (
                    <div className="animate-pulse h-full w-full flex items-center justify-center">
                        <div className="h-4/5 w-4/5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}