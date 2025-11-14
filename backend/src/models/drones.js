const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return drones.init(sequelize, DataTypes);
}

class drones extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    restaurant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true, // Changed to true - NULL means available for all restaurants
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    capacity: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    battery: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'drones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_drones_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
        ]
      },
    ]
  });
  }
}
