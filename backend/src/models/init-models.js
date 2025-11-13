const DataTypes = require("sequelize").DataTypes;
const _addresses = require("./addresses");
const _cart_items = require("./cart_items");
const _carts = require("./carts");
const _categories = require("./categories");
const _deliveries = require("./deliveries");
const _drones = require("./drones");
const _locations = require("./locations");
const _menu_items = require("./menu_items");
const _order_items = require("./order_items");
const _orders = require("./orders");
const _payments = require("./payments");
const _restaurants = require("./restaurants");
const _roles = require("./roles");
const _users = require("./users");

function initModels(sequelize) {
  const addresses = _addresses(sequelize, DataTypes);
  const cart_items = _cart_items(sequelize, DataTypes);
  const carts = _carts(sequelize, DataTypes);
  const categories = _categories(sequelize, DataTypes);
  const deliveries = _deliveries(sequelize, DataTypes);
  const drones = _drones(sequelize, DataTypes);
  const locations = _locations(sequelize, DataTypes);
  const menu_items = _menu_items(sequelize, DataTypes);
  const order_items = _order_items(sequelize, DataTypes);
  const orders = _orders(sequelize, DataTypes);
  const payments = _payments(sequelize, DataTypes);
  const restaurants = _restaurants(sequelize, DataTypes);
  const roles = _roles(sequelize, DataTypes);
  const users = _users(sequelize, DataTypes);

  // addresses relations
  addresses.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(addresses, { as: "addresses", foreignKey: "user_id"});
  
  cart_items.belongsTo(carts, { as: "cart", foreignKey: "cart_id"});
  carts.hasMany(cart_items, { as: "cart_items", foreignKey: "cart_id"});
  menu_items.belongsTo(categories, { as: "category", foreignKey: "category_id"});
  categories.hasMany(menu_items, { as: "menu_items", foreignKey: "category_id"});
  categories.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(categories, { as: "categories", foreignKey: "restaurant_id"});
  deliveries.belongsTo(drones, { as: "drone", foreignKey: "drone_id"});
  drones.hasMany(deliveries, { as: "deliveries", foreignKey: "drone_id"});
  locations.belongsTo(drones, { as: "drone", foreignKey: "drone_id"});
  drones.hasMany(locations, { as: "locations", foreignKey: "drone_id"});
  cart_items.belongsTo(menu_items, { as: "item", foreignKey: "item_id"});
  menu_items.hasMany(cart_items, { as: "cart_items", foreignKey: "item_id"});
  order_items.belongsTo(menu_items, { as: "item", foreignKey: "item_id"});
  menu_items.hasMany(order_items, { as: "order_items", foreignKey: "item_id"});
  deliveries.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(deliveries, { as: "deliveries", foreignKey: "order_id"});
  order_items.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(order_items, { as: "order_items", foreignKey: "order_id"});
  payments.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasOne(payments, { as: "payment", foreignKey: "order_id"});
  carts.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(carts, { as: "carts", foreignKey: "restaurant_id"});
  drones.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(drones, { as: "drones", foreignKey: "restaurant_id"});
  menu_items.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(menu_items, { as: "menu_items", foreignKey: "restaurant_id"});
  orders.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(orders, { as: "orders", foreignKey: "restaurant_id"});
  users.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(users, { as: "users", foreignKey: "role_id"});
  carts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(carts, { as: "carts", foreignKey: "user_id"});
  orders.belongsTo(users, { as: "customer", foreignKey: "customer_id"});
  users.hasMany(orders, { as: "orders", foreignKey: "customer_id"});
  restaurants.belongsTo(users, { as: "owner", foreignKey: "owner_id"});
  users.hasMany(restaurants, { as: "restaurants", foreignKey: "owner_id"});
  restaurants.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by"});
  users.hasMany(restaurants, { as: "approved_by_restaurants", foreignKey: "approved_by"});

  return {
    addresses,
    cart_items,
    carts,
    categories,
    deliveries,
    drones,
    locations,
    menu_items,
    order_items,
    orders,
    payments,
    restaurants,
    roles,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
