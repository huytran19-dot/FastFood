const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return carts.init(sequelize, DataTypes);
}

class carts extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    restaurant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'carts',
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
        name: "idx_carts_user",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "idx_carts_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
        ]
      },
    ]
  });
  }
}
