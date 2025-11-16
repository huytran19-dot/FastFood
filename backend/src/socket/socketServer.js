const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO instance
 */
function initializeSocketIO(httpServer) {
  if (io) {
    console.log('⚠️  Socket.IO already initialized');
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173', // User web app
        'http://localhost:5174', // Admin app
        'http://localhost:5175', // Restaurant app
        'http://localhost:5176', // Web app (alternate)
        'http://localhost:5177', // Admin app (alternate)
        'http://localhost:5178', // Admin app (alternate 2)
        'http://localhost:5179', // Admin app (alternate 3)
        'http://localhost:5180', // Restaurant app (alternate)
        'http://localhost:5181'  // Web app (alternate 2)
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    // Handle order tracking room join (for customer tracking page)
    socket.on('join:order', (orderId) => {
      const room = `order:${orderId}`;
      socket.join(room);
      socket.emit('joined:order', { orderId, room });
    });

    // Handle order tracking room leave
    socket.on('leave:order', (orderId) => {
      const room = `order:${orderId}`;
      socket.leave(room);
    });

    // Handle drone tracking room join (for restaurant admin)
    socket.on('join:drone', (droneId) => {
      const room = `drone:${droneId}`;
      socket.join(room);
      socket.emit('joined:drone', { droneId, room });
    });

    // Handle drone tracking room leave
    socket.on('leave:drone', (droneId) => {
      const room = `drone:${droneId}`;
      socket.leave(room);
    });

    socket.on('disconnect', () => {});
  });

  console.log('✅ Socket.IO server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
  }
  return io;
}

/**
 * Emit drone update to all clients in drone room
 * @param {number} droneId - Drone ID
 * @param {Object} payload - Update payload
 */
function emitDroneUpdate(droneId, payload) {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized, cannot emit drone update');
    return;
  }

  const room = `drone:${droneId}`;
  io.to(room).emit('drone:update', payload);
  
  // Also emit to general drone channel for monitoring
  io.emit('drone:global:update', { droneId, ...payload });
}

/**
 * Emit drone delivery completed
 * @param {number} droneId - Drone ID
 * @param {Object} payload - Completion payload
 */
function emitDroneCompleted(droneId, payload) {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized, cannot emit completion');
    return;
  }

  const room = `drone:${droneId}`;
  io.to(room).emit('drone:completed', payload);
  io.emit('drone:global:completed', { droneId, ...payload });
}

/**
 * Emit order status update to all clients
 * @param {number} orderId - Order ID
 * @param {Object} payload - Update payload (status, delivery_otp, droneStatus, message, etc.)
 */
function emitOrderUpdate(orderId, payload) {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized, cannot emit order update');
    return;
  }

  io.emit('order:update', { orderId, ...payload });
}

/**
 * Emit drone status update to all clients (for drone list refresh)
 * @param {Object} payload - Update payload (droneId, status, orderId, etc.)
 */
function emitDroneStatusUpdate(payload) {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized, cannot emit drone status update');
    return;
  }

  io.emit('drone:status:update', payload);
}

module.exports = {
  initializeSocketIO,
  getIO,
  emitDroneUpdate,
  emitDroneCompleted,
  emitOrderUpdate,
  emitDroneStatusUpdate
};

