import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

export function MapPlaceholder({ startLocation, endLocation, isAnimating = false  }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnimating) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const droneX = 10 + (progress / 100) * 80;
  const droneY = 50 - Math.sin((progress / 100) * Math.PI) * 20;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-gray-200">
      <div className="relative w-full h-64 bg-white rounded-lg shadow-inner overflow-hidden">
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4D4F" />
              <stop offset="100%" stopColor="#00B8A9" />
            </linearGradient>
          </defs>

          <path
            d="M 10,50 Q 50,20 90,50"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            strokeDasharray="8,4"
            opacity="0.5"
          />

          <circle cx="10" cy="50" r="8" fill="#FF4D4F" />
          <text x="10" y="70" textAnchor="middle" fontSize="10" fill="#1F2937" fontWeight="600">
            Bắt đầu
          </text>

          <circle cx="90" cy="50" r="8" fill="#00B8A9" />
          <text x="90" y="70" textAnchor="middle" fontSize="10" fill="#1F2937" fontWeight="600">
            Đích
          </text>

          {isAnimating && (
            <g transform={`translate(${droneX}, ${droneY})`}>
              <circle r="12" fill="#3B82F6" opacity="0.2" />
              <circle r="6" fill="#3B82F6" />
            </g>
          )}
        </svg>

        {isAnimating && (
          <div
            className="absolute transition-all duration-100 ease-linear"
            style={{
              left: `${droneX}%`, top,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Plane className="text-blue-600" size={24} style={{ transform: 'rotate(45deg)' }} />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Điểm đi:</span>
          <span className="font-medium text-gray-900">{startLocation}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Điểm đến:</span>
          <span className="font-medium text-gray-900">{endLocation}</span>
        </div>
        {isAnimating && (
          <div className="pt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4D4F] to-[#00B8A9] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Đang bay... {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
