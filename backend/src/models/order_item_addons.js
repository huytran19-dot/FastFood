const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return order_item_addons.init(sequelize, DataTypes);
}

class order_item_addons extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    order_item_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'order_items',
        key: 'id'
      }
    },
    addon_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'addons',
        key: 'id'
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_delta: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'order_item_addons',
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
        name: "order_item_id",
        using: "BTREE",
        fields: [
          { name: "order_item_id" },
        ]
      },
      {
        name: "addon_id",
        using: "BTREE",
        fields: [
          { name: "addon_id" },
        ]
      },
    ]
  });
  }
}
