const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('locations', {
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
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: true
    },
    altitude: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: true
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
};
