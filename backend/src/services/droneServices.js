const db = require('../models');
const { orders, drones, drone_assignments } = db;
const { getRedisClient, setJson, getJson } = require('../redis/redisClient');

class DroneService {
  /**
   * Tự động gán drone cho đơn hàng
   * @param {number} orderId - ID của đơn hàng
   * @returns {Promise<{order, drone, assignment}>}
   */
  async autoAssignDrone(orderId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Load order by id
      const order = await orders.findByPk(orderId, { transaction });
      
      if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      // Find available drone with status = 'Rảnh' or 'IDLE' (for compatibility)
      const drone = await drones.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { status: 'Rảnh' },
            { status: 'IDLE' }
          ]
        },
        order: [['id', 'ASC']],
        transaction
      });

      if (!drone) {
        throw new Error('Không có drone nào khả dụng');
      }

      // Create drone_assignment record
      const assignment = await drone_assignments.create({
        order_id: order.id,
        drone_id: drone.id,
        status: 'ASSIGNED'
      }, { transaction });

      // Update drone status to 'DISPATCHING' (Đang điều phối)
      await drone.update({
        status: 'Đang điều phối'
      }, { transaction });

      // Update order: set drone_id and keep status as CONFIRMED
      // Note: We don't change order.status to 'ASSIGNED' as it's not in the ENUM
      // Instead, we just set drone_id to mark it as assigned
      await order.update({
        drone_id: drone.id
      }, { transaction });

      await transaction.commit();

      return {
        order,
        drone,
        assignment
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lấy thông tin drone được gán cho đơn hàng
   * @param {number} orderId - ID của đơn hàng
   * @returns {Promise<{assignment, drone, order}>}
   */
  async getDroneForOrder(orderId) {
    const assignment = await drone_assignments.findOne({
      where: {
        order_id: orderId
      },
      include: [
        {
          model: drones,
          as: 'drone',
          attributes: ['id', 'model', 'capacity', 'battery', 'status']
        },
        {
          model: orders,
          as: 'order',
          attributes: ['id', 'status', 'total_price', 'delivery_address']
        }
      ]
    });

    if (!assignment) {
      return null;
    }

    return {
      assignment,
      drone: assignment.drone,
      order: assignment.order
    };
  }

  /**
   * Cập nhật trạng thái drone
   * @param {number} droneId - ID của drone
   * @param {string} status - Trạng thái mới (tiếng Việt)
   * @returns {Promise<void>}
   */
  async updateDroneStatus(droneId, status) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const drone = await drones.findByPk(droneId, { transaction });
      
      if (!drone) {
        throw new Error('Không tìm thấy drone');
      }

      // Update drone status
      await drone.update({ status }, { transaction });

      // If there is an active assignment (status not DONE/CANCELLED), update its status consistently
      const activeAssignment = await drone_assignments.findOne({
        where: {
          drone_id: droneId,
          status: {
            [db.Sequelize.Op.notIn]: ['DONE', 'CANCELLED']
          }
        },
        transaction
      });

      if (activeAssignment) {
        // Map Vietnamese drone status to assignment status
        const statusMap = {
          'Rảnh': 'DONE', // Drone is idle, assignment should be done
          'Đang điều phối': 'ASSIGNED',
          'Đang giao hàng': 'EN_ROUTE',
          'Hoàn thành': 'DELIVERED'
        };

        const assignmentStatus = statusMap[status];
        if (assignmentStatus) {
          await activeAssignment.update({ status: assignmentStatus }, { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lưu vị trí drone vào Redis
   * @param {number} droneId - ID của drone
   * @param {Object} payload - { lat, lng, status, ts }
   * @returns {Promise<boolean>}
   */
  async setDronePosition(droneId, payload) {
    const key = `drone:${droneId}:position`;
    const value = {
      lat: payload.lat,
      lng: payload.lng,
      status: payload.status || 'Đang giao hàng',
      ts: payload.ts || new Date().toISOString()
    };
    
    // Set with 1 hour expiration
    const result = await setJson(key, value, 3600);
    
    return result;
  }

  /**
   * Lấy vị trí drone từ Redis
   * @param {number} droneId - ID của drone
   * @returns {Promise<Object|null>} - { lat, lng, status, ts } or null
   */
  async getDronePosition(droneId) {
    const key = `drone:${droneId}:position`;
    const position = await getJson(key);
    
    return position;
  }
}

module.exports = new DroneService();

