import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function DataTable({ data, columns, onRowClick, emptyMessage = 'Không có dữ liệu' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;

    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal === bVal) return 0;

    const comparison = aVal > bVal ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      {column.header}
                      {sortKey === column.key && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
