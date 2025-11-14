const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return drone_assignments.init(sequelize, DataTypes);
}

class drone_assignments extends Sequelize.Model {
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
      allowNull: false,
      references: {
        model: 'drones',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('ASSIGNED','EN_ROUTE','DELIVERED','DONE','CANCELLED'),
      allowNull: false,
      defaultValue: 'ASSIGNED'
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    released_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'drone_assignments',
    timestamps: false,
    underscored: true,
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
        name: "uq_drone_assignments_order",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "idx_drone_assignments_drone_status",
        using: "BTREE",
        fields: [
          { name: "drone_id" },
          { name: "status" },
        ]
      },
    ]
  });
  }
}

