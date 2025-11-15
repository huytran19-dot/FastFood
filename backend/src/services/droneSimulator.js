const db = require('../models');
const { locations, drone_assignments, orders } = db;
const droneService = require('./droneServices');

// Map to store active simulation intervals: Map<droneId, intervalId>
const activeSimulations = new Map();

/**
 * Bắt đầu mô phỏng di chuyển của drone theo tuyến đường
 * @param {number} droneId - ID của drone
 * @param {number} orderId - ID của đơn hàng
 * @param {Array<{lat: number, lng: number}>} routePoints - Mảng các điểm trên tuyến đường
 * @param {Object} options - Tùy chọn
 * @param {number} options.intervalMs - Khoảng thời gian giữa các bước (mặc định: 2000ms)
 * @param {number} options.saveToDbEvery - Số bước để lưu vào database một lần (mặc định: 5)
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

  const intervalMs = options.intervalMs || 2000;
  const saveToDbEvery = options.saveToDbEvery || 5;

  let currentIndex = 0;
  let stepCount = 0;

  // Update assignment status to EN_ROUTE when simulation starts
  try {
    const assignment = await drone_assignments.findOne({
      where: {
        drone_id: droneId,
        order_id: orderId
      }
    });

    if (assignment) {
      await assignment.update({ status: 'EN_ROUTE' });
    }

    // Update drone status to 'Đang giao hàng'
    await droneService.updateDroneStatus(droneId, 'Đang giao hàng');
  } catch (error) {
    console.error(`Error updating assignment/drone status for drone ${droneId}:`, error);
  }

  // Create interval to step through route points
  const intervalId = setInterval(async () => {
    try {
      // Check if we've reached the end
      if (currentIndex >= routePoints.length) {
        // Simulation complete
        clearInterval(intervalId);
        activeSimulations.delete(droneId);

        // Update assignment status to DELIVERED
        try {
          const assignment = await drone_assignments.findOne({
            where: {
              drone_id: droneId,
              order_id: orderId
            }
          });

          if (assignment) {
            await assignment.update({ 
              status: 'DELIVERED',
              released_at: new Date()
            });
          }

          // Update order status to DELIVERING (if not already)
          const order = await orders.findByPk(orderId);
          if (order && order.status !== 'DELIVERING') {
            await order.update({ status: 'DELIVERING' });
          }

          // Update drone status to 'Hoàn thành' or 'Rảnh' (idle)
          await droneService.updateDroneStatus(droneId, 'Rảnh');
        } catch (error) {
          console.error(`Error completing simulation for drone ${droneId}:`, error);
        }

        return;
      }

      // Get current route point
      const point = routePoints[currentIndex];
      stepCount++;
      currentIndex++;

      // Update Redis position
      const positionSaved = await droneService.setDronePosition(droneId, {
        lat: point.lat,
        lng: point.lng,
        status: 'EN_ROUTE',
        ts: new Date().toISOString()
      });

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

module.exports = {
  startDroneSimulation,
  stopDroneSimulation,
  isSimulationRunning,
  getActiveSimulations
};

