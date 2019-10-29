module.exports = app => {
    const { STRING, INTEGER, DATE, TEXT } = app.Sequelize

    const WechatEssay =  app.model.define('WechatEssay', {
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
        essay_user_image_url: STRING(64),
        essay_user_avatar: STRING(84),
        essay_user_nickname: STRING(64),
        essay_content: STRING(255),
        review_num: INTEGER,
        bookmarked_num: INTEGER,
        thumbsup_num: INTEGER,
        created_at: DATE,
        updated_at: DATE,
    }, {
        tableName: 'wechat_essay',
        timestamps: true,
        underscored: true,
    })

    return WechatEssay
}
