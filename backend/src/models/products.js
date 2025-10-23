const { Model, DataTypes } = require('sequelize');

class Product extends Model {
  static initModel(sequelize) {
    super.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'categories',
            key: 'id',
          },
        },
        name: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        best_seller: {
          type: DataTypes.TINYINT,
          allowNull: true,
          defaultValue: 0,
        },
      },
      {
        sequelize, // quan trọng
        tableName: 'products',
        timestamps: false,
      }
    );
    return Product; // phải trả về class Product
  }
}

module.exports = Product;
