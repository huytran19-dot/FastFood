const DataTypes = require("sequelize").DataTypes;
const _addon_price = require("./addon_price");
const _addons = require("./addons");
const _cart_item_addons = require("./cart_item_addons");
const _cart_items = require("./cart_items");
const _carts = require("./carts");
const _categories = require("./categories");
const _order_item_addons = require("./order_item_addons");
const _order_items = require("./order_items");
const _orders = require("./orders");
const _product_tags = require("./product_tags");
const _products = require("./products");
const _skus = require("./skus");
const _users = require("./users");

function initModels(sequelize) {
  const addon_price = _addon_price(sequelize, DataTypes);
  const addons = _addons(sequelize, DataTypes);
  const cart_item_addons = _cart_item_addons(sequelize, DataTypes);
  const cart_items = _cart_items(sequelize, DataTypes);
  const carts = _carts(sequelize, DataTypes);
  const categories = _categories(sequelize, DataTypes);
  const order_item_addons = _order_item_addons(sequelize, DataTypes);
  const order_items = _order_items(sequelize, DataTypes);
  const orders = _orders(sequelize, DataTypes);
  const product_tags = _product_tags(sequelize, DataTypes);
  const products = _products(sequelize, DataTypes);
  const skus = _skus(sequelize, DataTypes);
  const users = _users(sequelize, DataTypes);

  addon_price.belongsTo(addons, { as: "addon", foreignKey: "addon_id"});
  addons.hasMany(addon_price, { as: "addon_prices", foreignKey: "addon_id"});
  cart_item_addons.belongsTo(addons, { as: "addon", foreignKey: "addon_id"});
  addons.hasMany(cart_item_addons, { as: "cart_item_addons", foreignKey: "addon_id"});
  order_item_addons.belongsTo(addons, { as: "addon", foreignKey: "addon_id"});
  addons.hasMany(order_item_addons, { as: "order_item_addons", foreignKey: "addon_id"});
  cart_item_addons.belongsTo(cart_items, { as: "cart_item", foreignKey: "cart_item_id"});
  cart_items.hasMany(cart_item_addons, { as: "cart_item_addons", foreignKey: "cart_item_id"});
  cart_items.belongsTo(carts, { as: "cart", foreignKey: "cart_id"});
  carts.hasMany(cart_items, { as: "cart_items", foreignKey: "cart_id"});
  products.belongsTo(categories, { as: "category", foreignKey: "category_id"});
  categories.hasMany(products, { as: "products", foreignKey: "category_id"});
  order_item_addons.belongsTo(order_items, { as: "order_item", foreignKey: "order_item_id"});
  order_items.hasMany(order_item_addons, { as: "order_item_addons", foreignKey: "order_item_id"});
  order_items.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(order_items, { as: "order_items", foreignKey: "order_id"});
  product_tags.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(product_tags, { as: "product_tags", foreignKey: "product_id"});
  skus.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(skus, { as: "skus", foreignKey: "product_id"});
  cart_items.belongsTo(skus, { as: "sku", foreignKey: "sku_id"});
  skus.hasMany(cart_items, { as: "cart_items", foreignKey: "sku_id"});
  order_items.belongsTo(skus, { as: "sku", foreignKey: "sku_id"});
  skus.hasMany(order_items, { as: "order_items", foreignKey: "sku_id"});
  carts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(carts, { as: "cart", foreignKey: "user_id"});
  orders.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(orders, { as: "orders", foreignKey: "user_id"});

  return {
    addon_price,
    addons,
    cart_item_addons,
    cart_items,
    carts,
    categories,
    order_item_addons,
    order_items,
    orders,
    product_tags,
    products,
    skus,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
