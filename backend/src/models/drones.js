const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('drones', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    restaurant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    capacity: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    battery: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
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
};
