const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('restaurants', {
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
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
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
    }
  }, {
    sequelize,
    tableName: 'restaurants',
    timestamps: true,
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
    ]
  });
};
