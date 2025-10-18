import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { getPayments } from '../../api/admin';
export function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPayments();
        setPayments(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    { key: 'payment_id', header: 'Mã thanh toán', sortable: true },
    { key: 'order_id', header: 'Mã đơn', sortable: true },
    {
      key: 'amount',
      header: 'Số tiền',
      render: (p) => formatCurrency(p.amount),
      sortable: true
    },
    { key: 'method', header: 'Phương thức' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p) => <Badge status={p.status || 'PENDING'} type="payment" />
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      render: (p) => new Date(p.created_at).toLocaleString('vi-VN'),
      sortable: true
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Thanh toán</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Thanh toán</h1>
      <DataTable data={payments} columns={columns} />
    </div>
  );
}
