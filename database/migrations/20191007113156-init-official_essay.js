'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const { DATE, STRING, INTEGER } = Sequelize
    await queryInterface.createTable('official_essay', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      organization_name: {
        type: STRING(32),
        unique: true,
        allowNull: false,
        references: {
          model: 'organization',
          key: 'organization_name',
        },
      },
      essay_url: STRING(84),
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
    await queryInterface.dropTable('official_essay')
  },
}
