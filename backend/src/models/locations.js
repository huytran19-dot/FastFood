const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return locations.init(sequelize, DataTypes);
}

class locations extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    drone_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'drones',
        key: 'id'
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: false
    },
    altitude: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: true
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'locations',
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
        name: "idx_locations_drone",
        using: "BTREE",
        fields: [
          { name: "drone_id" },
        ]
      },
      {
        name: "idx_locations_time",
        using: "BTREE",
        fields: [
          { name: "recorded_at" },
        ]
      },
    ]
  });
  }
}
