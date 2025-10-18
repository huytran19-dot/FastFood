export function Badge({ status, type = 'order' }) {
  const getColorClasses = () => {
    if (type === 'order') {
      switch (status) {
        case 'PENDING':
          return 'bg-amber-100 text-amber-800';
        case 'PAID':
          return 'bg-green-100 text-green-800';
        case 'PREPARING':
          return 'bg-blue-100 text-blue-800';
        case 'READY_FOR_DELIVERY':
          return 'bg-purple-100 text-purple-800';
        case 'DELIVERING':
          return 'bg-indigo-100 text-indigo-800';
        case 'COMPLETED':
          return 'bg-green-100 text-green-800';
        case 'CANCELLED':
          return 'bg-red-100 text-red-800';
        case 'FAILED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    if (type === 'delivery') {
      switch (status) {
        case 'ASSIGNED':
          return 'bg-blue-100 text-blue-800';
        case 'EN_ROUTE':
          return 'bg-purple-100 text-purple-800';
        case 'DROPPED':
          return 'bg-green-100 text-green-800';
        case 'FAILED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    if (type === 'drone') {
      switch (status) {
        case 'IDLE':
          return 'bg-gray-100 text-gray-800';
        case 'DISPATCHING':
          return 'bg-blue-100 text-blue-800';
        case 'EN_ROUTE':
          return 'bg-purple-100 text-purple-800';
        case 'RETURNING':
          return 'bg-amber-100 text-amber-800';
        case 'INACTIVE':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    if (type === 'payment') {
      switch (status) {
        case 'SUCCESS':
          return 'bg-green-100 text-green-800';
        case 'FAILED':
          return 'bg-red-100 text-red-800';
        case 'PENDING':
          return 'bg-amber-100 text-amber-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    if (type === 'user') {
      return status === '1' || status === 1 || status === 'active'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';
    }

    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorClasses()}`}>
      {status}
    </span>
  );
}
