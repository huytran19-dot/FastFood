const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return restaurants.init(sequelize, DataTypes);
}

class restaurants extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    delivery_time_estimate: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rating: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    }, 
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    open_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    close_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    review_status: {
      type: DataTypes.ENUM('PENDING','APPROVED','REJECTED'),
      allowNull: false,
      defaultValue: "PENDING"
    },
    reject_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lat: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
      comment: 'Vĩ độ (latitude) của nhà hàng'
    },
    lng: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
      comment: 'Kinh độ (longitude) của nhà hàng'
    }
  }, {
    sequelize,
    tableName: 'restaurants',
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
        name: "uq_restaurants_owner_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "owner_id" },
          { name: "name" },
        ]
      },
      {
        name: "fk_restaurants_approved_by",
        using: "BTREE",
        fields: [
          { name: "approved_by" },
        ]
      },
      {
        name: "idx_restaurants_owner",
        using: "BTREE",
        fields: [
          { name: "owner_id" },
        ]
      },
      {
        name: "idx_restaurants_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_restaurants_review",
        using: "BTREE",
        fields: [
          { name: "review_status" },
        ]
      },
      {
        name: "idx_restaurants_city",
        using: "BTREE",
        fields: [
          { name: "city" },
        ]
      },
      {
        name: "idx_coordinates",
        using: "BTREE",
        fields: [
          { name: "lat" },
          { name: "lng" },
        ]
      },
    ]
  });
  }
}
