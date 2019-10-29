module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize

    const WechatEssayComment =  app.model.define('WechatEssayComment', {
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
        comment_user_avatar: STRING(84),
        comment_user_nickname: STRING(64),
        comment_content: STRING(255),
        created_at: DATE,
        updated_at: DATE,
    }, {
        tableName: 'wechat_essay_comment',
        timestamps: true,
        underscored: true,
    })

    WechatEssayComment.associate = function() {
        WechatEssayComment.belongsTo(app.model.Stu.WechatEssay, { foreignKey: 'attached_essay_id', targetKey: 'id' })
    }

    return WechatEssayComment
}
