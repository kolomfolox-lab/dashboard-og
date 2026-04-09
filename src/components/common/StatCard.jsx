const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-700',
        green: 'from-green-500 to-green-700',
        blue: 'from-blue-500 to-blue-700',
        orange: 'from-orange-500 to-orange-700',
        purple: 'from-purple-500 to-purple-700',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{trend === 'up' ? '↑' : '↓'}</span>
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="text-2xl" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
