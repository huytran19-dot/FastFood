const db = require('../models');
const { orders, drones } = db;
const socketServer = require('../socket/socketServer');
const { setJson, getJson } = require('../redis/redisClient');

// Store active simulations to avoid duplicates
// Structure: Map<simulationKey, {intervalId, phase, droneId, orderId, ...}>
const activeSimulations = new Map();

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} Distance in kilometers
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
 * Get route information for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<{startLat, startLng, endLat, endLng, restaurantName, customerName}>}
 */
async function getOrderRouteInfo(orderId) {
  const order = await orders.findByPk(orderId, {
    include: [
      {
        model: db.restaurants,
        as: 'restaurant',
        attributes: ['id', 'name', 'lat', 'lng', 'address']
      },
      {
        model: db.users,
        as: 'customer',
        attributes: ['id', 'full_name']
      }
    ]
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.restaurant) {
    throw new Error('Restaurant not found for this order');
  }

  // Get restaurant coordinates
  const startLat = parseFloat(order.restaurant.lat);
  const startLng = parseFloat(order.restaurant.lng);

  if (isNaN(startLat) || isNaN(startLng)) {
    throw new Error(`Restaurant coordinates not available. lat: ${order.restaurant.lat}, lng: ${order.restaurant.lng}`);
  }

  // Try to get delivery coordinates from order
  // If not available, generate random destination near restaurant (within 0.05 degrees ~ 5km)
  let endLat, endLng;
  
  if (order.delivery_lat && order.delivery_lng) {
    endLat = parseFloat(order.delivery_lat);
    endLng = parseFloat(order.delivery_lng);
  } else {
    // For demo: generate random destination near restaurant
    endLat = startLat + (Math.random() - 0.5) * 0.05;
    endLng = startLng + (Math.random() - 0.5) * 0.05;
  }

  if (isNaN(endLat) || isNaN(endLng)) {
    // Fallback to random if parsing failed
    endLat = startLat + (Math.random() - 0.5) * 0.05;
    endLng = startLng + (Math.random() - 0.5) * 0.05;
  }

  return {
    startLat,
    startLng,
    endLat,
    endLng,
    restaurantName: order.restaurant.name,
    customerName: order.customer?.full_name || 'Khách hàng',
    deliveryAddress: order.delivery_address
  };
}

/**
 * Start Phase 1: Drone flies TO_CUSTOMER
 */
async function startPhaseToCustomer({
  droneId,
  orderId,
  startLat,
  startLng,
  endLat,
  endLng,
  totalTimeMs = 30000,
  tickMs = 1000,
  onUpdate
}) {
  const simulationKey = `${droneId}_${orderId}_TO_CUSTOMER`;

  if (activeSimulations.has(simulationKey)) {
    throw new Error('Phase TO_CUSTOMER already running for this drone and order');
  }

  const startTime = Date.now();
  const totalDistance = calculateDistance(startLat, startLng, endLat, endLng);

  // Generate OTP and save to order
  const otp = generateOTP();
  try {
    await orders.update(
      { 
        status: 'DELIVERING',
        delivery_otp: otp,
        delivery_otp_verified: 0
      },
      { where: { id: orderId } }
    );
    console.log(`🔑 [OTP] Generated for order ${orderId}: ${otp} (DEMO - Display this for testing)`);
    
    // Emit order update for status change to DELIVERING
    socketServer.emitOrderUpdate(orderId, {
      status: 'DELIVERING',
      delivery_otp: otp,
      droneStatus: 'delivering',
      message: 'Drone đang bay tới địa chỉ giao hàng'
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
  }

  const intervalId = setInterval(async () => {
    try {
      const elapsed = Date.now() - startTime;
      let progress = elapsed / totalTimeMs;
      progress = Math.min(Math.max(progress, 0), 1);

      // Interpolate position
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;

      const distanceRemaining = calculateDistance(currentLat, currentLng, endLat, endLng);
      const etaMs = Math.max(0, (1 - progress) * totalTimeMs);

      const updatePayload = {
        droneId,
        orderId,
        phase: 'TO_CUSTOMER',
        lat: currentLat,
        lng: currentLng,
        progress: progress * 100,
        distanceRemaining: distanceRemaining * 1000, // meters
        distanceTraveled: (totalDistance - distanceRemaining) * 1000,
        totalDistance: totalDistance * 1000,
        etaMs: Math.round(etaMs),
        status: 'DELIVERING',
        timestamp: Date.now()
      };

      // Store in Redis (using helper that falls back to memory)
      await setJson(`drone:${droneId}:position`, {
        lat: currentLat,
        lng: currentLng,
        status: 'DELIVERING',
        phase: 'TO_CUSTOMER',
        ts: new Date().toISOString()
      }, 60);

      await setJson(`drone:${droneId}:location`, updatePayload, 60);

      // Emit update
      if (onUpdate) {
        onUpdate(updatePayload);
      }

      // Check if arrived at customer
      if (progress >= 1) {
        clearInterval(intervalId);
        activeSimulations.delete(simulationKey);

        // Force final position
        updatePayload.lat = endLat;
        updatePayload.lng = endLng;
        updatePayload.progress = 100;
        updatePayload.distanceRemaining = 0;
        updatePayload.etaMs = 0;
        updatePayload.status = 'WAITING_OTP';
        updatePayload.phase = 'WAITING_OTP';

        // Update order status to WAITING_OTP (NOT DELIVERED YET!)
        try {
          await orders.update(
            { status: 'WAITING_OTP' },
            { where: { id: orderId } }
          );
          console.log(`📦 Order ${orderId} status: WAITING_OTP`);
          
          // Update drone status in database
          await drones.update(
            { status: 'waiting_otp' },
            { where: { id: droneId } }
          );
          
          // Get drone model for event
          const drone = await drones.findByPk(droneId);
          
          // Emit order update via Socket.IO
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
          console.error('Error updating order status:', error);
        }

        // Emit final update
        if (onUpdate) {
          onUpdate(updatePayload);
        }

        // Store WAITING_OTP state
        const simState = {
          droneId,
          orderId,
          phase: 'WAITING_OTP',
          customerLat: endLat,
          customerLng: endLng,
          restaurantLat: startLat,
          restaurantLng: startLng
        };
        activeSimulations.set(`${droneId}_${orderId}_STATE`, simState);
      }
    } catch (error) {
      console.error(`❌ Error in TO_CUSTOMER phase:`, error);
    }
  }, tickMs);

  activeSimulations.set(simulationKey, {
    intervalId,
    phase: 'TO_CUSTOMER',
    droneId,
    orderId,
    startTime,
    startLat,
    startLng,
    endLat,
    endLng
  });

  return simulationKey;
}

/**
 * Start Phase 2: Drone RETURNING to restaurant
 */
async function startPhaseReturning({
  droneId,
  orderId,
  customerLat,
  customerLng,
  restaurantLat,
  restaurantLng,
  totalTimeMs = 20000, // Shorter return time
  tickMs = 1000,
  onUpdate
}) {
  const simulationKey = `${droneId}_${orderId}_RETURNING`;

  if (activeSimulations.has(simulationKey)) {
    throw new Error('Phase RETURNING already running');
  }

  // Update drone status to 'returning'
  try {
    await drones.update(
      { status: 'returning' },
      { where: { id: droneId } }
    );
    
    // Get drone model for event
    const drone = await drones.findByPk(droneId);
    
    // Emit drone status update
    socketServer.emitDroneStatusUpdate({
      droneId,
      status: 'returning',
      orderId,
      orderNumber: orderId,
      model: drone?.model
    });
  } catch (error) {
    console.error('Error updating drone status to returning:', error);
  }

  const startTime = Date.now();
  const totalDistance = calculateDistance(customerLat, customerLng, restaurantLat, restaurantLng);

  const intervalId = setInterval(async () => {
    try {
      const elapsed = Date.now() - startTime;
      let progress = elapsed / totalTimeMs;
      progress = Math.min(Math.max(progress, 0), 1);

      // Interpolate position (customer → restaurant)
      const currentLat = customerLat + (restaurantLat - customerLat) * progress;
      const currentLng = customerLng + (restaurantLng - customerLng) * progress;

      const distanceRemaining = calculateDistance(currentLat, currentLng, restaurantLat, restaurantLng);
      const etaMs = Math.max(0, (1 - progress) * totalTimeMs);

      const updatePayload = {
        droneId,
        orderId,
        phase: 'RETURNING',
        lat: currentLat,
        lng: currentLng,
        progress: progress * 100,
        distanceRemaining: distanceRemaining * 1000,
        distanceTraveled: (totalDistance - distanceRemaining) * 1000,
        totalDistance: totalDistance * 1000,
        etaMs: Math.round(etaMs),
        status: 'RETURNING',
        timestamp: Date.now()
      };

      // Store in Redis (using helper that falls back to memory)
      await setJson(`drone:${droneId}:position`, {
        lat: currentLat,
        lng: currentLng,
        status: 'RETURNING',
        phase: 'RETURNING',
        ts: new Date().toISOString()
      }, 60);

      await setJson(`drone:${droneId}:location`, updatePayload, 60);

      // Emit update
      if (onUpdate) {
        onUpdate(updatePayload);
      }

      // Check if arrived at restaurant
      if (progress >= 1) {
        clearInterval(intervalId);
        activeSimulations.delete(simulationKey);

        // Force final position
        updatePayload.lat = restaurantLat;
        updatePayload.lng = restaurantLng;
        updatePayload.progress = 100;
        updatePayload.distanceRemaining = 0;
        updatePayload.etaMs = 0;
        updatePayload.status = 'IDLE';
        updatePayload.phase = 'AT_RESTAURANT';

        // Update drone status in database to idle
        try {
          await drones.update(
            { status: 'idle' },
            { where: { id: droneId } }
          );
          
          // Get drone model for event
          const drone = await drones.findByPk(droneId);
          
          // Emit drone status update
          socketServer.emitDroneStatusUpdate({
            droneId,
            status: 'idle',
            orderId: null,
            orderNumber: null,
            model: drone?.model
          });
        } catch (error) {
          console.error('Error updating drone status:', error);
        }

        // Emit order update - drone returned to restaurant
        socketServer.emitOrderUpdate(orderId, {
          status: 'COMPLETED',
          droneStatus: 'idle',
          message: 'Drone đã bay về nhà hàng'
        });

        // Emit final update
        if (onUpdate) {
          onUpdate(updatePayload);
        }

        // Clean up state
        activeSimulations.delete(`${droneId}_${orderId}_STATE`);
      }
    } catch (error) {
      console.error(`❌ Error in RETURNING phase:`, error);
    }
  }, tickMs);

  activeSimulations.set(simulationKey, {
    intervalId,
    phase: 'RETURNING',
    droneId,
    orderId,
    startTime,
    startLat: customerLat,
    startLng: customerLng,
    endLat: restaurantLat,
    endLng: restaurantLng
  });

  return simulationKey;
}

/**
 * Get simulation state for a drone+order
 */
function getSimulationState(droneId, orderId) {
  const stateKey = `${droneId}_${orderId}_STATE`;
  return activeSimulations.get(stateKey);
}

/**
 * Stop all simulations for a drone+order
 */
function stopAllSimulations(droneId, orderId) {
  const keys = [
    `${droneId}_${orderId}_TO_CUSTOMER`,
    `${droneId}_${orderId}_RETURNING`,
    `${droneId}_${orderId}_STATE`
  ];

  let stopped = false;
  keys.forEach(key => {
    const sim = activeSimulations.get(key);
    if (sim && sim.intervalId) {
      clearInterval(sim.intervalId);
      stopped = true;
    }
    activeSimulations.delete(key);
  });

  return stopped;
}

/**
 * Get all active simulations
 */
function getActiveSimulations() {
  return Array.from(activeSimulations.keys());
}

module.exports = {
  startPhaseToCustomer,
  startPhaseReturning,
  getSimulationState,
  stopAllSimulations,
  getActiveSimulations,
  getOrderRouteInfo,
  calculateDistance,
  generateOTP
};

