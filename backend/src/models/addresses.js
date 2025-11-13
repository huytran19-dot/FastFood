const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('addresses', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "ID người dùng",
      references: {
        model: 'users',
        key: 'id'
      }
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Tên người nhận"
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Số điện thoại người nhận"
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Địa chỉ chi tiết"
    },
    lat: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: true,
      comment: "Vĩ độ (latitude) để drone bay đến"
    },
    lng: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: true,
      comment: "Kinh độ (longitude) để drone bay đến"
    },
    is_default: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "Địa chỉ mặc định (1=yes, 0=no)"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'addresses',
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
        name: "idx_user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
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
      {
        name: "idx_default",
        using: "BTREE",
        fields: [
          { name: "user_id" },
          { name: "is_default" },
        ]
      },
    ]
  });
};
