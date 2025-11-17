const db = require('../models');
const { locations, drone_assignments, orders, drones } = db;
const droneService = require('./droneServices');
const socketServer = require('../socket/socketServer');

// Map to store active simulation intervals: Map<droneId, intervalId>
const activeSimulations = new Map();

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // in km
}

/**
 * Bắt đầu mô phỏng di chuyển của drone theo tuyến đường với Socket.IO và OTP
 * @param {number} droneId - ID của drone
 * @param {number} orderId - ID của đơn hàng
 * @param {Array<{lat: number, lng: number}>} routePoints - Mảng các điểm trên tuyến đường
 * @param {Object} options - Tùy chọn
 * @param {number} options.intervalMs - Khoảng thời gian giữa các bước (mặc định: 1000ms)
 * @param {number} options.saveToDbEvery - Số bước để lưu vào database một lần (mặc định: 5)
 * @param {Function} options.onUpdate - Callback function nhận (updatePayload) mỗi tick
 * @param {boolean} options.isReturning - True nếu đang bay về nhà hàng (không generate OTP)
 * @returns {Promise<void>}
 */
async function startDroneSimulation(droneId, orderId, routePoints, options = {}) {
  // Validate inputs
  if (!droneId || !orderId || !routePoints || routePoints.length === 0) {
    throw new Error('Thiếu thông tin cần thiết: droneId, orderId, và routePoints không được để trống');
  }

  // Check if simulation is already running for this drone
  if (activeSimulations.has(droneId)) {
    throw new Error(`Drone ${droneId} đang trong quá trình mô phỏng`);
  }

  const intervalMs = options.intervalMs || 1000;
  const saveToDbEvery = options.saveToDbEvery || 5;
  const onUpdate = options.onUpdate;
  const isReturning = options.isReturning || false;

  let currentIndex = 0;
  let stepCount = 0;
  const totalSteps = routePoints.length;
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    totalDistance += calculateDistance(
      routePoints[i].lat, routePoints[i].lng,
      routePoints[i + 1].lat, routePoints[i + 1].lng
    );
  }

  // Generate OTP and update order to DELIVERING (only if NOT returning)
  let otp = null;
  if (!isReturning) {
    otp = generateOTP();
    console.log(`🔐 [DRONE SIM] Order #${orderId} - Generated OTP: ${otp}`);
    
    try {
      const [updateCount] = await orders.update(
        { 
          status: 'DELIVERING',
          delivery_otp: otp,
          delivery_otp_verified: 0
        },
        { where: { id: orderId } }
      );
      
      console.log(`✅ [DRONE SIM] Order #${orderId} - OTP saved to database (${updateCount} row(s) updated)`);
    
      // Emit order update
      socketServer.emitOrderUpdate(orderId, {
        status: 'DELIVERING',
        delivery_otp: otp,
        droneStatus: 'delivering',
        message: 'Drone đang bay tới địa chỉ giao hàng'
      });
    } catch (error) {
      console.error(`❌ [DRONE SIM] Order #${orderId} - Error generating/saving OTP:`, error);
      throw error;
    }
  }

  // Update assignment status and drone status
  try {
    if (!isReturning) {
      const assignment = await drone_assignments.findOne({
        where: {
          drone_id: droneId,
          order_id: orderId
        }
      });

      if (assignment) {
        await assignment.update({ status: 'EN_ROUTE' });
      }
    }

    // Update drone status
    const droneStatus = isReturning ? 'returning' : 'delivering';
    await drones.update(
      { status: droneStatus },
      { where: { id: droneId } }
    );
    
    const drone = await drones.findByPk(droneId);
    
    // Emit drone status update
    socketServer.emitDroneStatusUpdate({
      droneId,
      status: droneStatus,
      orderId,
      orderNumber: orderId,
      model: drone?.model
    });
  } catch (error) {
    console.error(`Error updating assignment/drone status for drone ${droneId}:`, error);
  }

  const startPoint = routePoints[0];
  const endPoint = routePoints[routePoints.length - 1];

  // Create interval to step through route points
  const intervalId = setInterval(async () => {
    try {
      // Check if we've reached the end
      if (currentIndex >= routePoints.length) {
        clearInterval(intervalId);
        activeSimulations.delete(droneId);

        if (isReturning) {
          // Arrived at restaurant - set drone to idle
          try {
            // Update drone status to IDLE
            await db.drones.update(
              { status: 'IDLE' },
              { where: { id: droneId } }
            );
            
            const drone = await drones.findByPk(droneId);
            
            // Emit final position at restaurant
            const finalPayload = {
              droneId,
              orderId,
              phase: 'AT_RESTAURANT',
              lat: endPoint.lat,
              lng: endPoint.lng,
              progress: 100,
              distanceRemaining: 0,
              status: 'AT_RESTAURANT',
              timestamp: Date.now()
            };
            
            if (onUpdate) {
              onUpdate(finalPayload);
            }
            
            // Emit order update to notify frontend to remove order from list
            socketServer.emitOrderUpdate(orderId, {
              status: 'COMPLETED',
              droneStatus: 'idle',
              message: 'Drone đã về nhà hàng - Sẵn sàng cho đơn tiếp theo'
            });
            
            // Emit drone status update
            socketServer.emitDroneStatusUpdate({
              droneId,
              status: 'idle',
              orderId,
              orderNumber: orderId,
              model: drone?.model
            });
          } catch (error) {
            console.error(`Error updating drone ${droneId} to idle:`, error);
          }
        } else {
          // Arrived at customer - WAITING_OTP
          try {
            // Update order status to WAITING_OTP
            await orders.update(
              { status: 'WAITING_OTP' },
              { where: { id: orderId } }
            );
            
            // Update drone status
            await drones.update(
              { status: 'waiting_otp' },
              { where: { id: droneId } }
            );
            
            const drone = await drones.findByPk(droneId);
            
            // Emit final position at destination
            const finalPayload = {
              droneId,
              orderId,
              phase: 'WAITING_OTP',
              lat: endPoint.lat,
              lng: endPoint.lng,
              progress: 100,
              distanceRemaining: 0,
              status: 'WAITING_OTP',
              timestamp: Date.now()
            };
            
            if (onUpdate) {
              onUpdate(finalPayload);
            }
            
            // Emit order update
            socketServer.emitOrderUpdate(orderId, {
              status: 'WAITING_OTP',
              delivery_otp: otp,
              droneStatus: 'waiting_otp',
              message: 'Drone đã đến - Vui lòng nhận hàng và xác nhận OTP'
            });
            
            // Emit drone status update
            socketServer.emitDroneStatusUpdate({
              droneId,
              status: 'waiting_otp',
              orderId,
              orderNumber: orderId,
              model: drone?.model
            });
          } catch (error) {
            console.error(`Error updating status to WAITING_OTP for drone ${droneId}:`, error);
          }
        }

        return;
      }

      // Get current route point
      const point = routePoints[currentIndex];
      stepCount++;
      const progress = currentIndex / (routePoints.length - 1);
      
      // Calculate remaining distance
      let distanceRemaining = 0;
      for (let i = currentIndex; i < routePoints.length - 1; i++) {
        distanceRemaining += calculateDistance(
          routePoints[i].lat, routePoints[i].lng,
          routePoints[i + 1].lat, routePoints[i + 1].lng
        );
      }
      
      const distanceTraveled = totalDistance - distanceRemaining;

      currentIndex++;

      // Update Redis position
      await droneService.setDronePosition(droneId, {
        lat: point.lat,
        lng: point.lng,
        status: 'DELIVERING',
        ts: new Date().toISOString()
      });

      // Emit position update via Socket.IO
      const updatePayload = {
        droneId,
        orderId,
        phase: isReturning ? 'RETURNING' : 'TO_CUSTOMER',
        lat: point.lat,
        lng: point.lng,
        progress: progress * 100,
        distanceRemaining: distanceRemaining * 1000, // meters
        distanceTraveled: distanceTraveled * 1000,
        totalDistance: totalDistance * 1000,
        status: isReturning ? 'RETURNING' : 'DELIVERING',
        timestamp: Date.now()
      };
      
      if (onUpdate) {
        onUpdate(updatePayload);
      }

      // Save to database every N steps
      if (stepCount % saveToDbEvery === 0 || currentIndex === routePoints.length) {
        try {
          await locations.create({
            drone_id: droneId,
            latitude: point.lat,
            longitude: point.lng,
            altitude: null,
            recorded_at: new Date()
          });
        } catch (error) {
          console.error(`Error saving location to database for drone ${droneId}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error in simulation step for drone ${droneId}:`, error);
      // Continue simulation even if one step fails
    }
  }, intervalMs);

  // Store interval ID
  activeSimulations.set(droneId, intervalId);
}

/**
 * Dừng mô phỏng di chuyển của drone
 * @param {number} droneId - ID của drone
 * @returns {boolean} - true nếu đã dừng, false nếu không có simulation đang chạy
 */
function stopDroneSimulation(droneId) {
  const intervalId = activeSimulations.get(droneId);
  
  if (!intervalId) {
    return false;
  }

  clearInterval(intervalId);
  activeSimulations.delete(droneId);

  return true;
}

/**
 * Kiểm tra xem drone có đang trong quá trình mô phỏng không
 * @param {number} droneId - ID của drone
 * @returns {boolean}
 */
function isSimulationRunning(droneId) {
  return activeSimulations.has(droneId);
}

/**
 * Lấy danh sách tất cả các drone đang trong quá trình mô phỏng
 * @returns {Array<number>} - Mảng các droneId
 */
function getActiveSimulations() {
  return Array.from(activeSimulations.keys());
}

/**
 * Generate route points between two coordinates
 * @param {number} startLat - Starting latitude
 * @param {number} startLng - Starting longitude
 * @param {number} endLat - Ending latitude
 * @param {number} endLng - Ending longitude
 * @param {number} numPoints - Number of points to generate (default: 20)
 * @returns {Array<{lat: number, lng: number}>}
 */
function generateRoutePoints(startLat, startLng, endLat, endLng, numPoints = 20) {
  const points = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const progress = i / numPoints;
    const lat = startLat + (endLat - startLat) * progress;
    const lng = startLng + (endLng - startLng) * progress;
    points.push({ lat, lng });
  }
  
  return points;
}

module.exports = {
  startDroneSimulation,
  stopDroneSimulation,
  isSimulationRunning,
  getActiveSimulations,
  generateRoutePoints,
  calculateDistance,
  generateOTP
};

