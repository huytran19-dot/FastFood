const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return skus.init(sequelize, DataTypes);
}

class skus extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    size_inch: {
      type: DataTypes.ENUM('9','12'),
      allowNull: false
    },
    crust: {
      type: DataTypes.ENUM('DAY','VUA','MONG'),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'skus',
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
        name: "uk_sku",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "product_id" },
          { name: "size_inch" },
          { name: "crust" },
        ]
      },
    ]
  });
  }
}
