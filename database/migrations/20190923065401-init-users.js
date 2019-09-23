'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const { DATE, STRING, BLOB } = Sequelize
    await queryInterface.createTable('user', {
      id: {
        type: STRING(32),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      info: BLOB,
      created_at: DATE,
      updated_at: DATE,
    })
    await queryInterface.createTable('password', {
      id: {
        type: STRING(32),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      password: {
        type: STRING(64),
        allowNull: false,
      },
      created_at: DATE,
      updated_at: DATE,
    })
    await queryInterface.createTable('user_login_state', {
      id: {
        type: STRING(32),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
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
    await queryInterface.dropTable('password')
    await queryInterface.dropTable('user_login_state')
    await queryInterface.dropTable('user')
  },
}
