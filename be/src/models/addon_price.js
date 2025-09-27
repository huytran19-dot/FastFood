const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return addon_price.init(sequelize, DataTypes);
}

class addon_price extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    addon_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'addons',
        key: 'id'
      }
    },
    size_inch: {
      type: DataTypes.ENUM('9','12'),
      allowNull: false,
      primaryKey: true
    },
    delta: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'addon_price',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "addon_id" },
          { name: "size_inch" },
        ]
      },
    ]
  });
  }
}
