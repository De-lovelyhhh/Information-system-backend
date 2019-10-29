
module.exports = {
    up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
        const { DATE, STRING, INTEGER } = Sequelize
        await queryInterface.createTable('wechat_essay', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },
            essay_user_id: {
                type: STRING(32),
                unique: false,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id',
                },
            },
            essay_user_identity: STRING(64),
            essay_content: STRING(255),
            essay_user_image_url: STRING(64),
            review_num: INTEGER,
            essay_user_avatar: STRING(84),
            essay_user_nickname: STRING(64),
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
                unique: false,
                references: {
                    model: 'wechat_essay',
                    key: 'id',
                },
            },
            comment_user_id: {
                type: STRING(32),
                unique: false,
                allowNull: false,
            },
            comment_user_identity: STRING(64),
            comment_content: STRING(255),
            comment_user_avatar: STRING(84),
            comment_user_nickname: STRING(64),
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
        await queryInterface.dropTable('wechat_essay_comment')
        await queryInterface.dropTable('wechat_essay')
    },
}
