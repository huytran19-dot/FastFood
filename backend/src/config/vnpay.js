require('dotenv').config();

const vnpayConfig = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || 'W00D8ZKE',
  vnp_HashSecret: process.env.VNP_HASH_SECRET || '5N26GIL6BDH4E3ILJMSTVIO24P9EJR8N',
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5000/api/orders/vnpay-return',
};

module.exports = { vnpayConfig };
