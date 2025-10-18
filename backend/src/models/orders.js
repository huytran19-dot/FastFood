const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return orders.init(sequelize, DataTypes);
}

class orders extends Sequelize.Model {
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
      }
    },
    customer_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    address_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    delivery_mode: {
      type: DataTypes.ENUM('DELIVERY','PICKUP'),
      allowNull: true,
      defaultValue: "DELIVERY"
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.ENUM('ATM','CARD','MOMO','ZALOPAY','SHOPEEPAY','COD'),
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM('UNPAID','PAID'),
      allowNull: true,
      defaultValue: "UNPAID"
    },
    voucher_code: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    voucher_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0.00
    },
    subtotal: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0.00
    },
    grand_total: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'orders',
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
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
