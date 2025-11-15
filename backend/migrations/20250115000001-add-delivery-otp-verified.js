'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Check if column exists first
    const tableDescription = await queryInterface.describeTable('orders');
    
    if (!tableDescription.delivery_otp_verified) {
      // Add delivery_otp_verified column as TINYINT(1)
      await queryInterface.addColumn('orders', 'delivery_otp_verified', {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
        comment: 'OTP verification status: 0 = not verified, 1 = verified'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if column exists before removing
    const tableDescription = await queryInterface.describeTable('orders');
    
    if (tableDescription.delivery_otp_verified) {
      await queryInterface.removeColumn('orders', 'delivery_otp_verified');
    }
  }
};
