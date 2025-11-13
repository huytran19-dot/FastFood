const db = require('../models');
const { Op } = require('sequelize');

// Get all menu items for a restaurant
exports.getMenuItems = async (restaurantId, filters = {}) => {
  try {
    const where = { restaurant_id: restaurantId };

    // Add filters
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    if (filters.is_available !== undefined) {
      where.is_available = filters.is_available;
    }

    const menuItems = await db.menu_items.findAll({
      where,
      include: [{
        model: db.categories,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });

    return menuItems;
  } catch (error) {
    throw error;
  }
};

// Get single menu item
exports.getMenuItemById = async (id, restaurantId) => {
  try {
      const menuItem = await db.menu_items.findOne({
      where: { 
        id,
        restaurant_id: restaurantId 
      },
      include: [{
        model: db.categories,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!menuItem) {
      throw new Error('Không tìm thấy món ăn');
    }

    return menuItem;
  } catch (error) {
    throw error;
  }
};

// Create menu item
exports.createMenuItem = async (restaurantId, data) => {
  try {
    const menuItem = await db.menu_items.create({
      restaurant_id: restaurantId,
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.image_url,
      category_id: data.category_id || null,
      is_available: data.is_available !== undefined ? data.is_available : true
    });

    // Reload with category
    await menuItem.reload({
      include: [{
        model: db.categories,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    return menuItem;
  } catch (error) {
    throw error;
  }
};

// Update menu item
exports.updateMenuItem = async (id, restaurantId, data) => {
  try {
    const menuItem = await db.menu_items.findOne({
      where: { 
        id,
        restaurant_id: restaurantId 
      }
    });

    if (!menuItem) {
      throw new Error('Không tìm thấy món ăn');
    }

    await menuItem.update({
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.image_url,
      category_id: data.category_id !== undefined ? data.category_id : menuItem.category_id,
      is_available: data.is_available
    });

    // Reload with category
    await menuItem.reload({
      include: [{
        model: db.categories,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    return menuItem;
  } catch (error) {
    throw error;
  }
};

// Toggle menu item availability
exports.toggleMenuItemAvailability = async (id, restaurantId) => {
  try {
    const menuItem = await db.menu_items.findOne({
      where: { 
        id,
        restaurant_id: restaurantId 
      }
    });

    if (!menuItem) {
      throw new Error('Không tìm thấy món ăn');
    }

    await menuItem.update({
      is_available: !menuItem.is_available
    });

    return menuItem;
  } catch (error) {
    throw error;
  }
};

// Delete menu item
exports.deleteMenuItem = async (id, restaurantId) => {
  try {
    const menuItem = await db.menu_items.findOne({
      where: { 
        id,
        restaurant_id: restaurantId 
      }
    });

    if (!menuItem) {
      throw new Error('Không tìm thấy món ăn');
    }

    await menuItem.destroy();

    return { message: 'Xóa món ăn thành công' };
  } catch (error) {
    throw error;
  }
};

// Get menu statistics
exports.getMenuStats = async (restaurantId) => {
  try {
    const total = await db.menu_items.count({
      where: { restaurant_id: restaurantId }
    });

    const available = await db.menu_items.count({
      where: { 
        restaurant_id: restaurantId,
        is_available: true 
      }
    });

    const unavailable = await db.menu_items.count({
      where: { 
        restaurant_id: restaurantId,
        is_available: false 
      }
    });

    return {
      total,
      available,
      unavailable
    };
  } catch (error) {
    throw error;
  }
};
