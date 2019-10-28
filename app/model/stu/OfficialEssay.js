module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize

    const OfficialEssay =  app.model.define('OfficialEssay', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        organization_name: {
            type: STRING(32),
            unique: false,
            allowNull: false,
            references: {
                model: 'organization',
                key: 'organization_name',
            },
        },
        essay_content: STRING(256),
        essay_url: STRING(84),
        created_at: DATE,
        updated_at: DATE,
    }, {
        tableName: 'official_essay',
        timestamps: true,
        underscored: true,
    })

    return OfficialEssay
}
