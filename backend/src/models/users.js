const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return users.init(sequelize, DataTypes);
}

class users extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "uq_users_email"
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    email_verified: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Email verification status'
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Token for email verification'
    },
    email_verification_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Token expiration time'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "uq_users_email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "idx_users_role",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "idx_email_verification_token",
        using: "BTREE",
        fields: [
          { name: "email_verification_token" },
        ]
      },
    ]
  });
  }
}
