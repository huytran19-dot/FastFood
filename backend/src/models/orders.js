const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return orders.init(sequelize, DataTypes);
}

class orders extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    restaurant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    total_price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    delivery_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING','CONFIRMED','PREPARING','DELIVERING','COMPLETED','CANCELLED'),
      allowNull: false,
      defaultValue: "PENDING"
    }
  }, {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
        name: "idx_orders_customer",
        using: "BTREE",
        fields: [
          { name: "customer_id" },
        ]
      },
      {
        name: "idx_orders_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
        ]
      },
      {
        name: "idx_orders_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
  }
}
