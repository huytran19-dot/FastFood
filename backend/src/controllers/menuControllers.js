const menuServices = require('../services/menuServices');
const db = require('../models');

// GET /api/menu - Get all menu items for restaurant owner
exports.getMenuItems = async (req, res) => {
  try {
    // Get restaurant for logged-in user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const filters = {
      search: req.query.search,
      is_available: req.query.is_available
    };

    const menuItems = await menuServices.getMenuItems(restaurant.id, filters);

    res.json(menuItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/menu/:id - Get single menu item
exports.getMenuItemById = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const menuItem = await menuServices.getMenuItemById(req.params.id, restaurant.id);

    res.json(menuItem);
  } catch (error) {
    console.error('Get menu item error:', error);
    if (error.message === 'Không tìm thấy món ăn') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/menu - Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const { name, description, price, image_url, is_available, category_id } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ message: 'Tên và giá là bắt buộc' });
    }

    const menuItem = await menuServices.createMenuItem(restaurant.id, {
      name,
      description,
      price,
      image_url,
      is_available,
      category_id
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/menu/:id - Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const { name, description, price, image_url, is_available, category_id } = req.body;

    const menuItem = await menuServices.updateMenuItem(req.params.id, restaurant.id, {
      name,
      description,
      price,
      image_url,
      is_available,
      category_id
    });

    res.json(menuItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    if (error.message === 'Không tìm thấy món ăn') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PATCH /api/menu/:id/toggle - Toggle availability
exports.toggleMenuItemAvailability = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const menuItem = await menuServices.toggleMenuItemAvailability(req.params.id, restaurant.id);

    res.json(menuItem);
  } catch (error) {
    console.error('Toggle menu item error:', error);
    if (error.message === 'Không tìm thấy món ăn') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// DELETE /api/menu/:id - Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const result = await menuServices.deleteMenuItem(req.params.id, restaurant.id);

    res.json(result);
  } catch (error) {
    console.error('Delete menu item error:', error);
    if (error.message === 'Không tìm thấy món ăn') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/menu/stats - Get menu statistics
exports.getMenuStats = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const stats = await menuServices.getMenuStats(restaurant.id);

    res.json(stats);
  } catch (error) {
    console.error('Get menu stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
