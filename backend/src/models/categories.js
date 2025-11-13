const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return categories.init(sequelize, DataTypes);
}

class categories extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    restaurant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      comment: 'ID của nhà hàng sở hữu category này'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'categories',
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
        name: "uq_categories_restaurant_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
          { name: "name" },
        ]
      },
      {
        name: "idx_categories_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
        ]
      },
      {
        name: "idx_categories_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
  }
}
