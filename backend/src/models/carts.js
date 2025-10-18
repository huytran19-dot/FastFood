const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return carts.init(sequelize, DataTypes);
}

class carts extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "carts_ibfk_1"
    },
    session_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: "uk_cart_session"
    },
    delivery_mode: {
      type: DataTypes.ENUM('DELIVERY','PICKUP'),
      allowNull: true,
      defaultValue: "DELIVERY"
    }
  }, {
    sequelize,
    tableName: 'carts',
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
        name: "uk_cart_user",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "uk_cart_session",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "session_id" },
        ]
      },
    ]
  });
  }
}
