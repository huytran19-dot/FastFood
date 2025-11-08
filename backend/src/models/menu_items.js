const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return menu_items.init(sequelize, DataTypes);
}

class menu_items extends Sequelize.Model {
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
      }
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'menu_items',
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
        name: "uq_menu_items_restaurant_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
          { name: "name" },
        ]
      },
      {
        name: "idx_menu_items_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurant_id" },
        ]
      },
      {
        name: "idx_menu_items_available",
        using: "BTREE",
        fields: [
          { name: "is_available" },
        ]
      },
      {
        name: "idx_menu_items_category",
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
    ]
  });
  }
}
