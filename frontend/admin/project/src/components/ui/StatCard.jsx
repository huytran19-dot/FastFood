export function StatCard({ title, value, delta, icon: Icon, iconColor = 'text-blue-600' }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
          {delta && (
            <p className="text-sm text-gray-500 mt-1">{delta}</p>
          )}
        </div>
        {Icon && (
          <div className={`${iconColor} bg-opacity-10 p-4 rounded-xl`}>
            <Icon size={28} className={iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}
