const db = require('../models');

// ===== CATEGORY MANAGEMENT FOR RESTAURANT =====

// GET /api/restaurant/categories - Get all categories for current restaurant
exports.getAllCategories = async (req, res) => {
  try {
    // Get restaurant for logged-in user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const restaurantId = restaurant.id;

    const categories = await db.categories.findAll({
      where: { restaurant_id: restaurantId },
      attributes: ['id', 'name', 'status', 'created_at', 'updated_at'],
      include: [{
        model: db.menu_items,
        as: 'menu_items',
        attributes: ['id'],
        where: { restaurant_id: restaurantId },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    // Count menu items for each category
    const categoriesWithCount = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      status: cat.status,
      menu_items_count: cat.menu_items?.length || 0,
      created_at: cat.created_at,
      updated_at: cat.updated_at
    }));

    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/restaurant/categories - Create new category
exports.createCategory = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const restaurantId = restaurant.id;
    const { name, status = 1 } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Tên danh mục không được để trống' });
    }

    // Check if category name already exists for this restaurant
    const existingCategory = await db.categories.findOne({
      where: { 
        restaurant_id: restaurantId,
        name: name.trim()
      }
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'Danh mục này đã tồn tại trong nhà hàng của bạn' 
      });
    }

    // Create category
    const category = await db.categories.create({
      restaurant_id: restaurantId,
      name: name.trim(),
      status: status
    });

    res.status(201).json({ 
      message: 'Tạo danh mục thành công',
      category: {
        id: category.id,
        name: category.name,
        status: category.status,
        menu_items_count: 0,
        created_at: category.created_at,
        updated_at: category.updated_at
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle unique constraint error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Danh mục này đã tồn tại trong nhà hàng của bạn' 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/restaurant/categories/:id - Update category
exports.updateCategory = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const restaurantId = restaurant.id;
    const { id } = req.params;
    const { name, status } = req.body;

    // Find category
    const category = await db.categories.findOne({
      where: { 
        id: id,
        restaurant_id: restaurantId 
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Tên danh mục không được để trống' });
      }

      // Check if new name conflicts with existing category
      if (name.trim() !== category.name) {
        const existingCategory = await db.categories.findOne({
          where: { 
            restaurant_id: restaurantId,
            name: name.trim(),
            id: { [db.Sequelize.Op.ne]: id }
          }
        });

        if (existingCategory) {
          return res.status(400).json({ 
            message: 'Danh mục này đã tồn tại trong nhà hàng của bạn' 
          });
        }
      }
    }

    // Update category
    await category.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(status !== undefined && { status })
    });

    // Get menu items count
    const menuItemsCount = await db.menu_items.count({
      where: { 
        category_id: category.id,
        restaurant_id: restaurantId
      }
    });

    res.json({ 
      message: 'Cập nhật danh mục thành công',
      category: {
        id: category.id,
        name: category.name,
        status: category.status,
        menu_items_count: menuItemsCount,
        created_at: category.created_at,
        updated_at: category.updated_at
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Danh mục này đã tồn tại trong nhà hàng của bạn' 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// DELETE /api/restaurant/categories/:id - Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const restaurantId = restaurant.id;
    const { id } = req.params;

    // Find category
    const category = await db.categories.findOne({
      where: { 
        id: id,
        restaurant_id: restaurantId 
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Check if category has menu items
    const menuItemsCount = await db.menu_items.count({
      where: { 
        category_id: id,
        restaurant_id: restaurantId
      }
    });

    if (menuItemsCount > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa danh mục này vì có ${menuItemsCount} món ăn đang sử dụng. Vui lòng chuyển các món ăn sang danh mục khác trước.`
      });
    }

    // Delete category
    await category.destroy();

    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PATCH /api/restaurant/categories/:id/toggle-status - Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const restaurantId = restaurant.id;
    const { id } = req.params;

    const category = await db.categories.findOne({
      where: { 
        id: id,
        restaurant_id: restaurantId 
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    const newStatus = category.status === 1 ? 0 : 1;
    await category.update({ status: newStatus });

    res.json({ 
      message: `Đã ${newStatus === 1 ? 'kích hoạt' : 'vô hiệu hóa'} danh mục`,
      category: {
        id: category.id,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = exports;
