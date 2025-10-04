const Product = require("../models/products");

const productService = {
  getAllProducts: async () => {
    return await Product.findAll();
  },

  getProductById: async (id) => {
    return await Product.findByPk(id);
  },

  createProduct: async (data) => {
    return await Product.create(data);
  },

  updateProduct: async (id, data) => {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(data);
    return product;
  },

  deleteProduct: async (id) => {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return product;
  },
};

module.exports = productService;
