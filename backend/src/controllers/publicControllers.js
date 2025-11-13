const publicService = require('../services/publicServices');

// Lấy danh sách nhà hàng đã approved
const getRestaurants = async (req, res) => {
  try {
    console.log('🏪 [Public] Fetching approved restaurants...');
    const restaurants = await publicService.getApprovedRestaurants();
    
    console.log(`✅ [Public] Found ${restaurants.length} approved restaurants`);
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('❌ [Public] Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết nhà hàng
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🏪 [Public] Fetching restaurant ${id}...`);
    
    const restaurant = await publicService.getRestaurantById(id);
    
    console.log(`✅ [Public] Found restaurant: ${restaurant.name}`);
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('❌ [Public] Error fetching restaurant:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant',
        error: error.message
      });
    }
  }
};

// Lấy menu của nhà hàng
const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 [Public] Fetching menu for restaurant ${id}...`);
    
    const data = await publicService.getRestaurantMenu(id);
    
    console.log(`✅ [Public] Found ${data.menuItems.length} menu items for ${data.restaurant.name}`);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ [Public] Error fetching menu:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu',
        error: error.message
      });
    }
  }
};

// Lấy categories của nhà hàng
const getRestaurantCategories = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🏷️ [Public] Fetching categories for restaurant ${id}...`);
    
    const categories = await publicService.getRestaurantCategories(id);
    
    console.log(`✅ [Public] Found ${categories.length} categories`);
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ [Public] Error fetching categories:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getRestaurantCategories
};
