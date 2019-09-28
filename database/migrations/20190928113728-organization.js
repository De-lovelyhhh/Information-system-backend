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
  },

  down: async querInterface => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await querInterface.dropTable('organization')
  },
}
