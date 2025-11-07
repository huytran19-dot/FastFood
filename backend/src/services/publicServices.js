const db = require('../models');
const { restaurants, menu_items } = db;

class PublicService {
  // Lấy danh sách nhà hàng đã được approved
  async getApprovedRestaurants() {
    try {
      const restaurantList = await restaurants.findAll({
        where: {
          review_status: 'APPROVED'
        },
        attributes: ['id', 'name', 'address', 'phone', 'image_url', 'rating', 'created_at'],
        order: [['rating', 'DESC'], ['created_at', 'DESC']]
      });

      return restaurantList;
    } catch (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }
  }

  // Lấy thông tin chi tiết nhà hàng
  async getRestaurantById(restaurantId) {
    try {
      const restaurant = await restaurants.findOne({
        where: {
          id: restaurantId,
          review_status: 'APPROVED'
        },
        attributes: ['id', 'name', 'address', 'phone', 'image_url', 'rating', 'description', 'created_at']
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or not approved');
      }

      return restaurant;
    } catch (error) {
      throw error;
    }
  }

  // Lấy menu của nhà hàng
  async getRestaurantMenu(restaurantId) {
    try {
      // Kiểm tra nhà hàng có tồn tại và approved không
      const restaurant = await restaurants.findOne({
        where: {
          id: restaurantId,
          review_status: 'APPROVED'
        }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or not approved');
      }

      // Lấy menu items
      const menuItems = await menu_items.findAll({
        where: {
          restaurant_id: restaurantId,
          is_available: true // Chỉ lấy món đang available
        },
        attributes: ['id', 'name', 'description', 'price', 'image_url', 'category_id', 'created_at'],
        order: [['created_at', 'DESC']]
      });

      return {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          image_url: restaurant.image_url,
          rating: restaurant.rating
        },
        menuItems
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PublicService();
