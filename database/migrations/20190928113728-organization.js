'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const { DATE, STRING, TEXT, INTEGER } = Sequelize
    await queryInterface.createTable('organization', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      organization_name: {
        type: STRING(32),
        allowNull: false,
        unique: true,
      },
      organization_psw: STRING,
      organization_info: TEXT,
      avatar_url: STRING,
      created_at: DATE,
      updated_at: DATE,
    })
    await queryInterface.createTable('organization_login_state', {
      organization_name: {
        type: STRING(32),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'organization',
          key: 'organization_name',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      skey: {
        primaryKey: true,
        type: STRING(64),
        allowNull: false,
      },
      expire_at: {
        type: DATE,
        allowNull: false,
      },
      created_at: DATE,
      updated_at: DATE,
    })
  },

  down: async queryInterface => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.dropTable('organization')
    await queryInterface.dropTable('organization_login_state')
  },
}
