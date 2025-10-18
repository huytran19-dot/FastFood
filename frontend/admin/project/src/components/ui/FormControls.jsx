export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D4F] focus:border-transparent transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D4F] focus:border-transparent transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props  }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D4F] focus:border-transparent transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-[#00B8A9]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </div>
  );
}
