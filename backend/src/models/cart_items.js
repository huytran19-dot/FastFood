const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return cart_items.init(sequelize, DataTypes);
}

class cart_items extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    cart_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      }
    },
    item_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'menu_items',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'cart_items',
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
        name: "uq_cart_item",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cart_id" },
          { name: "item_id" },
        ]
      },
      {
        name: "fk_cart_items_item",
        using: "BTREE",
        fields: [
          { name: "item_id" },
        ]
      },
      {
        name: "idx_cart_items_cart",
        using: "BTREE",
        fields: [
          { name: "cart_id" },
        ]
      },
    ]
  });
  }
}
