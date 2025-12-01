const db = require('../models');
const { restaurants, menu_items, categories } = db;

class PublicService {
  // Lấy danh sách nhà hàng đã được approved
  async getApprovedRestaurants() {
    try {
      const restaurantList = await restaurants.findAll({
        where: {
          review_status: 'APPROVED',
          status: 1  // Only active restaurants
        },
        attributes: ['id', 'name', 'address', 'phone', 'image_url', 'rating', 'lat', 'lng', 'created_at'],
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
          review_status: 'APPROVED',
          status: 1  // Only active restaurants
        },
        attributes: ['id', 'name', 'address', 'phone', 'image_url', 'rating', 'description', 'lat', 'lng', 'created_at']
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
          review_status: 'APPROVED',
          status: 1  // Only active restaurants
        }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or not approved');
      }

      // Lấy menu items với category info
      const menuItems = await menu_items.findAll({
        where: {
          restaurant_id: restaurantId,
          is_available: true // Chỉ lấy món đang available
        },
        attributes: ['id', 'name', 'description', 'price', 'image_url', 'category_id', 'created_at'],
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['id', 'name', 'status'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          image_url: restaurant.image_url,
          rating: restaurant.rating,
          lat: restaurant.lat,
          lng: restaurant.lng
        },
        menuItems
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy categories của nhà hàng
  async getRestaurantCategories(restaurantId) {
    try {
      // Kiểm tra nhà hàng có tồn tại và approved không
      const restaurant = await restaurants.findOne({
        where: {
          id: restaurantId,
          review_status: 'APPROVED',
          status: 1  // Only active restaurants
        }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or not approved');
      }

      // Lấy categories với số lượng menu items
      const restaurantCategories = await categories.findAll({
        where: {
          restaurant_id: restaurantId
        },
        attributes: [
          'id',
          'name',
          'status',
          'created_at',
          [
            db.Sequelize.literal(`(
              SELECT COUNT(*)
              FROM menu_items
              WHERE menu_items.category_id = categories.id
              AND menu_items.is_available = true
            )`),
            'menu_items_count'
          ]
        ],
        order: [['created_at', 'ASC']]
      });

      return restaurantCategories;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PublicService();
