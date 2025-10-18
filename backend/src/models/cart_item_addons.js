const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return cart_item_addons.init(sequelize, DataTypes);
}

class cart_item_addons extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    cart_item_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'cart_items',
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
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'cart_item_addons',
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
        name: "cart_item_id",
        using: "BTREE",
        fields: [
          { name: "cart_item_id" },
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
