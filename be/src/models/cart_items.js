const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return cart_items.init(sequelize, DataTypes);
}

class cart_items extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    cart_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      }
    },
    sku_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'skus',
        key: 'id'
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
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
        name: "cart_id",
        using: "BTREE",
        fields: [
          { name: "cart_id" },
        ]
      },
      {
        name: "sku_id",
        using: "BTREE",
        fields: [
          { name: "sku_id" },
        ]
      },
    ]
  });
  }
}
