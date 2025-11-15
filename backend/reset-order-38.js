const db = require('./src/models');

async function resetOrder38() {
  try {
    console.log('🔄 Đang reset đơn hàng #38...\n');

    // Reset order status
    await db.orders.update(
      { 
        status: 'CONFIRMED',
        delivery_otp: null,
        delivery_otp_verified: 0
      },
      { where: { id: 38 } }
    );

    // Reset drone status to idle
    await db.drones.update(
      { status: 'idle' },
      { where: { id: 6 } }
    );

    // Get updated data
    const order = await db.orders.findByPk(38);
    const drone = await db.drones.findByPk(6);

    console.log('✅ Reset thành công!\n');
    console.log('📋 Trạng thái đơn hàng #38:');
    console.log('   - Order Status:', order.status);
    console.log('   - OTP:', order.delivery_otp);
    console.log('   - OTP Verified:', order.delivery_otp_verified);
    console.log('   - Drone ID:', order.drone_id);
    console.log('   - Drone Status:', drone.status);
    console.log('\n✅ Đơn hàng đã sẵn sàng để gán drone và bắt đầu bay lại!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi reset đơn hàng:', error);
    process.exit(1);
  }
}

resetOrder38();
