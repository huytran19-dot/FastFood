const { Model, DataTypes } = require("sequelize");

class Role extends Model {
  static initModel(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "roles",
        timestamps: false,
      }
    );
  }
}

module.exports = Role;
