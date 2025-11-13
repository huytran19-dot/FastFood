const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return payments.init(sequelize, DataTypes);
}

class payments extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      unique: "fk_payments_order"
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('COD','VNPAY','MOMO','BANK_TRANSFER'),
      allowNull: true
    },
    transaction_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING','PAID','FAILED','REFUNDED'),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payments',
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
        name: "uq_payments_order",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "idx_payments_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
  }
}
