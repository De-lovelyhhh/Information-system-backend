module.exports = app => {
    const { STRING, INTEGER, DATE, TEXT } = app.Sequelize

    const WechatEssayComment =  app.model.define('WechatEssayComment', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        user_id: {
            type: STRING(32),
            unique: false,
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
    }, {
        tableName: 'wechat_essay_comment',
        timestamps: true,
        underscored: true,
    })

    WechatEssayComment.associate = function() {
        WechatEssayComment.belongsTo(app.model.Stu.WechatEssay, { foreignKey: 'id' })
    }

    return WechatEssayComment
}
