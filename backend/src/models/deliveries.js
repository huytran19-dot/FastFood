const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return deliveries.init(sequelize, DataTypes);
}

class deliveries extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    drone_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'drones',
        key: 'id'
      }
    },
    start_location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    end_location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'deliveries',
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
        name: "idx_deliveries_order",
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "idx_deliveries_drone",
        using: "BTREE",
        fields: [
          { name: "drone_id" },
        ]
      },
      {
        name: "idx_deliveries_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
  }
}
