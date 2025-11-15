const express = require('express');
const router = express.Router();
const db = require('../models');
const droneSimService = require('../services/droneSimulationServiceV2');
const { emitDroneUpdate, emitOrderUpdate } = require('../socket/socketServer');

/**
 * POST /api/drone/demo-start-v2
 * Start drone delivery with OTP flow
 */
router.post('/demo-start-v2', async (req, res) => {
  try {
    const { orderId, droneId = 1 } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId là bắt buộc'
      });
    }

    // Get route info
    const routeInfo = await droneSimService.getOrderRouteInfo(orderId);

    // Start Phase TO_CUSTOMER
    const simulationKey = await droneSimService.startPhaseToCustomer({
      droneId,
      orderId,
      startLat: routeInfo.startLat,
      startLng: routeInfo.startLng,
      endLat: routeInfo.endLat,
      endLng: routeInfo.endLng,
      totalTimeMs: 30000,
      tickMs: 1000,
      onUpdate: (payload) => {
        emitDroneUpdate(droneId, payload);
      }
    });

    // Get OTP for demo display
    const order = await db.orders.findByPk(orderId, {
      attributes: ['id', 'delivery_otp']
    });

    res.json({
      success: true,
      message: 'Drone đã bắt đầu bay đến khách hàng',
      data: {
        simulationKey,
        droneId,
        orderId,
        phase: 'TO_CUSTOMER',
        otp: order.delivery_otp, // For DEMO - show OTP
        route: {
          start: {
            lat: routeInfo.startLat,
            lng: routeInfo.startLng,
            name: routeInfo.restaurantName
          },
          end: {
            lat: routeInfo.endLat,
            lng: routeInfo.endLng,
            address: routeInfo.deliveryAddress
          }
        }
      }
    });

  } catch (error) {
    console.error('Error starting demo-v2:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi bắt đầu simulation'
    });
  }
});

/**
 * POST /api/orders/:orderId/verify-otp
 * Verify OTP to confirm delivery
 */
router.post('/orders/:orderId/verify-otp', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã OTP'
      });
    }

    // Get order
    const order = await db.orders.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check OTP
    if (order.delivery_otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không đúng, vui lòng thử lại'
      });
    }

    // Verify OTP and mark as COMPLETED
    await order.update({
      delivery_otp_verified: 1,
      status: 'COMPLETED',
      delivered_at: new Date()
    });

    // Update payment if exists
    const payment = await db.payments.findOne({
      where: { order_id: orderId }
    });

    if (payment && payment.status !== 'PAID') {
      await payment.update({ status: 'PAID' });
    }

    console.log(`✅ [OTP] Verified for order ${orderId} - Status: COMPLETED`);

    // Update drone status to 'returning' immediately
    if (order.drone_id) {
      await db.drones.update(
        { status: 'returning' },
        { where: { id: order.drone_id } }
      );
    }

    // Emit order update - drone is now returning
    emitOrderUpdate(orderId, {
      status: 'COMPLETED',
      droneStatus: 'returning',
      message: 'Đã xác nhận OTP - Drone đang bay về nhà hàng'
    });

    // Emit event
    emitDroneUpdate(order.drone_id, {
      orderId,
      phase: 'COMPLETED_WAITING_RETURN',
      status: 'COMPLETED_WAITING_RETURN',
      message: 'OTP verified - ready to return'
    });

    // Auto-start return flight after OTP verification
    const simState = droneSimService.getSimulationState(order.drone_id, orderId);
    if (simState && simState.customerLat && simState.restaurantLat) {
      await droneSimService.startPhaseReturning({
        droneId: order.drone_id,
        orderId: orderId,
        customerLat: simState.customerLat,
        customerLng: simState.customerLng,
        restaurantLat: simState.restaurantLat,
        restaurantLng: simState.restaurantLng,
        totalTimeMs: 20000, // 20 seconds return flight
        onUpdate: (data) => {
          emitDroneUpdate(order.drone_id, data);
        }
      });
    }

    res.json({
      success: true,
      message: 'Xác nhận OTP thành công! Đơn hàng đã được giao.',
      data: {
        orderId,
        status: 'COMPLETED',
        deliveredAt: order.delivered_at
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xác nhận OTP'
    });
  }
});

/**
 * POST /api/drone/:droneId/return-to-restaurant
 * Start drone returning to restaurant
 */
router.post('/drone/:droneId/return-to-restaurant', async (req, res) => {
  try {
    const { droneId } = req.params;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId là bắt buộc'
      });
    }

    // Get simulation state
    const simState = droneSimService.getSimulationState(droneId, orderId);

    if (!simState) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin drone. Drone có thể chưa hoàn thành giao hàng.'
      });
    }

    if (simState.phase !== 'WAITING_OTP') {
      return res.status(400).json({
        success: false,
        message: `Drone đang ở phase: ${simState.phase}. Chỉ có thể quay về khi ở phase WAITING_OTP.`
      });
    }

    // Check order is COMPLETED
    const order = await db.orders.findByPk(orderId);
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa được xác nhận hoàn tất (OTP chưa đúng)'
      });
    }

    // Start RETURNING phase
    const simulationKey = await droneSimService.startPhaseReturning({
      droneId: parseInt(droneId),
      orderId: parseInt(orderId),
      customerLat: simState.customerLat,
      customerLng: simState.customerLng,
      restaurantLat: simState.restaurantLat,
      restaurantLng: simState.restaurantLng,
      totalTimeMs: 20000, // 20 seconds to return
      tickMs: 1000,
      onUpdate: (payload) => {
        emitDroneUpdate(droneId, payload);
      }
    });

    res.json({
      success: true,
      message: 'Drone đang quay về nhà hàng',
      data: {
        simulationKey,
        droneId,
        orderId,
        phase: 'RETURNING'
      }
    });

  } catch (error) {
    console.error('Error starting return:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi bắt đầu quay về'
    });
  }
});

/**
 * GET /api/drone/:droneId/position
 * Get current drone position from Redis
 */
router.get('/drone/:droneId/position', async (req, res) => {
  try {
    const { droneId } = req.params;
    const { orderId } = req.query;

    const droneService = require('../services/droneServices');
    const position = await droneService.getDronePosition(droneId);

    if (!position) {
      return res.json({
        success: false,
        message: 'Drone chưa có vị trí',
        data: null
      });
    }

    res.json({
      success: true,
      data: position
    });

  } catch (error) {
    console.error('Error getting drone position:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy vị trí drone'
    });
  }
});

/**
 * GET /api/drone/:droneId/state-v2
 * Get current drone state (with phase info)
 */
router.get('/drone/:droneId/state-v2', async (req, res) => {
  try {
    const { droneId } = req.params;

    // Try Redis first
    try {
      const redisClient = require('../redis/redisClient');
      if (redisClient && redisClient.isAvailable && redisClient.isAvailable()) {
        const locationStr = await redisClient.get(`drone:${droneId}:location`);
        
        if (locationStr) {
          const state = JSON.parse(locationStr);
          return res.json({
            success: true,
            data: state,
            source: 'redis'
          });
        }
      }
    } catch (error) {
      console.log('Redis not available');
    }

    res.json({
      success: true,
      data: null,
      message: 'Drone chưa hoạt động',
      source: 'empty'
    });

  } catch (error) {
    console.error('Error getting drone state:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy trạng thái drone'
    });
  }
});

/**
 * POST /api/drone/:droneId/stop-v2
 * Stop all simulations for a drone
 */
router.post('/drone/:droneId/stop-v2', async (req, res) => {
  try {
    const { droneId } = req.params;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId là bắt buộc'
      });
    }

    const stopped = droneSimService.stopAllSimulations(parseInt(droneId), parseInt(orderId));

    if (stopped) {
      res.json({
        success: true,
        message: 'Đã dừng tất cả simulation'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy simulation đang chạy'
      });
    }

  } catch (error) {
    console.error('Error stopping simulation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi dừng simulation'
    });
  }
});

module.exports = router;

