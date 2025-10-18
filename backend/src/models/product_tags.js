const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return product_tags.init(sequelize, DataTypes);
}

class product_tags extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    tag: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'product_tags',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "product_id" },
          { name: "tag" },
        ]
      },
    ]
  });
  }
}
