'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // =====================================================
    // PART 1: Alter orders table - Add delivery OTP columns
    // =====================================================
    
    // Add delivery_otp column (using raw SQL to specify position)
    await queryInterface.sequelize.query(`
      ALTER TABLE \`orders\`
      ADD COLUMN \`delivery_otp\` VARCHAR(10) NULL
      AFTER \`drone_id\`
    `);

    // Add delivery_otp_expires_at column
    await queryInterface.sequelize.query(`
      ALTER TABLE \`orders\`
      ADD COLUMN \`delivery_otp_expires_at\` DATETIME NULL
      AFTER \`delivery_otp\`
    `);

    // Add delivery_otp_verified_at column
    await queryInterface.sequelize.query(`
      ALTER TABLE \`orders\`
      ADD COLUMN \`delivery_otp_verified_at\` DATETIME NULL
      AFTER \`delivery_otp_expires_at\`
    `);

    // Add foreign key constraint fk_orders_drone (if not exists)
    // Note: This constraint might already exist from previous migration
    // We'll use raw SQL to handle it safely
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`orders\`
        ADD CONSTRAINT \`fk_orders_drone\`
        FOREIGN KEY (\`drone_id\`)
        REFERENCES \`drones\`(\`id\`)
        ON DELETE SET NULL
      `);
    } catch (error) {
      // Constraint might already exist, ignore error
      if (!error.message.includes('Duplicate foreign key constraint') && 
          !error.message.includes('already exists')) {
        throw error;
      }
    }

    // =====================================================
    // PART 2: Create drone_assignments table
    // =====================================================
    
    await queryInterface.createTable('drone_assignments', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      drone_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'drones',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'DONE', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ASSIGNED'
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      released_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Bảng lưu thông tin gán drone cho đơn hàng'
    });

    // Add unique constraint on order_id
    await queryInterface.addIndex('drone_assignments', {
      fields: ['order_id'],
      unique: true,
      name: 'uq_drone_assignments_order'
    });

    // Add composite index on drone_id and status
    await queryInterface.addIndex('drone_assignments', {
      fields: ['drone_id', 'status'],
      name: 'idx_drone_assignments_drone_status'
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('drone_assignments', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_drone_assignments_order',
      references: {
        table: 'orders',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('drone_assignments', {
      fields: ['drone_id'],
      type: 'foreign key',
      name: 'fk_drone_assignments_drone',
      references: {
        table: 'drones',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // =====================================================
    // PART 1: Drop drone_assignments table
    // =====================================================
    
    // Drop foreign key constraints first
    try {
      await queryInterface.removeConstraint('drone_assignments', 'fk_drone_assignments_drone');
    } catch (error) {
      // Ignore if constraint doesn't exist
    }

    try {
      await queryInterface.removeConstraint('drone_assignments', 'fk_drone_assignments_order');
    } catch (error) {
      // Ignore if constraint doesn't exist
    }

    // Drop indexes
    try {
      await queryInterface.removeIndex('drone_assignments', 'uq_drone_assignments_order');
    } catch (error) {
      // Ignore if index doesn't exist
    }

    try {
      await queryInterface.removeIndex('drone_assignments', 'idx_drone_assignments_drone_status');
    } catch (error) {
      // Ignore if index doesn't exist
    }

    // Drop table
    await queryInterface.dropTable('drone_assignments');

    // =====================================================
    // PART 2: Remove columns from orders table
    // =====================================================
    
    // Remove foreign key constraint (if exists)
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`orders\`
        DROP FOREIGN KEY \`fk_orders_drone\`
      `);
    } catch (error) {
      // Ignore if constraint doesn't exist
    }

    // Remove columns
    await queryInterface.removeColumn('orders', 'delivery_otp_verified_at');
    await queryInterface.removeColumn('orders', 'delivery_otp_expires_at');
    await queryInterface.removeColumn('orders', 'delivery_otp');
  }
};

