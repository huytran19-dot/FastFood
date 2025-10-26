var DataTypes = require("sequelize").DataTypes;
var _cartItems = require("./cart_items");
var _carts = require("./carts");
var _deliveries = require("./deliveries");
var _drones = require("./drones");
var _locations = require("./locations");
var _menuItems = require("./menu_items");
var _orderItems = require("./order_items");
var _orders = require("./orders");
var _payments = require("./payments");
var _restaurants = require("./restaurants");
var _roles = require("./roles");
var _users = require("./users");

function initModels(sequelize) {
  var cartItems = _cartItems(sequelize, DataTypes);
  var carts = _carts(sequelize, DataTypes);
  var deliveries = _deliveries(sequelize, DataTypes);
  var drones = _drones(sequelize, DataTypes);
  var locations = _locations(sequelize, DataTypes);
  var menuItems = _menuItems(sequelize, DataTypes);
  var orderItems = _orderItems(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var payments = _payments(sequelize, DataTypes);
  var restaurants = _restaurants(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  cartItems.belongsTo(carts, { as: "cart", foreignKey: "cart_id"});
  carts.hasMany(cartItems, { as: "cart_items", foreignKey: "cart_id"});
  deliveries.belongsTo(drones, { as: "drone", foreignKey: "drone_id"});
  drones.hasMany(deliveries, { as: "deliveries", foreignKey: "drone_id"});
  locations.belongsTo(drones, { as: "drone", foreignKey: "drone_id"});
  drones.hasMany(locations, { as: "locations", foreignKey: "drone_id"});
  cartItems.belongsTo(menuItems, { as: "item", foreignKey: "item_id"});
  menuItems.hasMany(cartItems, { as: "cart_items", foreignKey: "item_id"});
  orderItems.belongsTo(menuItems, { as: "item", foreignKey: "item_id"});
  menuItems.hasMany(orderItems, { as: "order_items", foreignKey: "item_id"});
  deliveries.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(deliveries, { as: "deliveries", foreignKey: "order_id"});
  orderItems.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(orderItems, { as: "order_items", foreignKey: "order_id"});
  payments.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasOne(payments, { as: "payment", foreignKey: "order_id"});
  carts.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(carts, { as: "carts", foreignKey: "restaurant_id"});
  drones.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(drones, { as: "drones", foreignKey: "restaurant_id"});
  menuItems.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(menuItems, { as: "menu_items", foreignKey: "restaurant_id"});
  orders.belongsTo(restaurants, { as: "restaurant", foreignKey: "restaurant_id"});
  restaurants.hasMany(orders, { as: "orders", foreignKey: "restaurant_id"});
  users.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(users, { as: "users", foreignKey: "role_id"});
  carts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(carts, { as: "carts", foreignKey: "user_id"});
  orders.belongsTo(users, { as: "customer", foreignKey: "customer_id"});
  users.hasMany(orders, { as: "orders", foreignKey: "customer_id"});
  restaurants.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by"});
  users.hasMany(restaurants, { as: "restaurants", foreignKey: "approved_by"});
  restaurants.belongsTo(users, { as: "owner", foreignKey: "owner_id"});
  users.hasMany(restaurants, { as: "owner_restaurants", foreignKey: "owner_id"});

  return {
    cartItems,
    carts,
    deliveries,
    drones,
    locations,
    menuItems,
    orderItems,
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
