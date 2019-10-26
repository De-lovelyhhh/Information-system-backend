
module.exports = {
    up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
        const { DATE, STRING, INTEGER, TEXT } = Sequelize
        await queryInterface.createTable('wechat_essay', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },
            user_id: {
                type: STRING(32),
                unique: true,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id',
                },
            },
            content: TEXT,
            image_url: STRING(64),
            review_num: INTEGER,
            avatar: STRING(84),
            nickname: STRING(64),
            bookmarked_num: INTEGER,
            thumbsup_num: INTEGER,
            created_at: DATE,
            updated_at: DATE,
        })
        await queryInterface.createTable('wechat_essay_comment', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },
            attached_essay_id: {
                type: INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'wechat_essay',
                    key: 'id',
                },
            },
            user_id: {
                type: STRING(32),
                unique: true,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id',
                },
            },
            content: TEXT,
            avatar: STRING(84),
            nickname: STRING(64),
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
        await queryInterface.dropTable('wechat_essay')
    },
}
