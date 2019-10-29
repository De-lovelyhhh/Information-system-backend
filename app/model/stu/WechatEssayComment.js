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
        attached_essay_id: {
            type: INTEGER,
            allowNull: false,
            unique: false,
            references: {
                model: 'wechat_essay',
                key: 'id',
            },
        },
        user_id: {
            type: STRING(32),
            unique: true,
            allowNull: false,
        },
        identity: STRING,
        content: TEXT,
        avatar: STRING(84),
        nickname: STRING(64),
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
