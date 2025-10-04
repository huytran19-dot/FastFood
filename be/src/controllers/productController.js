const productService = require('../services/productServices');

// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy 1 sản phẩm theo id
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product id' });

    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Request body is empty' });
    }

    const product = await productService.createProduct(data);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product id' });

    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Request body is empty' });
    }

    const product = await productService.updateProduct(id, data);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product id' });

    const product = await productService.deleteProduct(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
