module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize

    const OA =  app.model.define('OA', {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        title: STRING(256),
        department: STRING(64),
        publishDate: STRING(64),
        created_at: DATE,
        updated_at: DATE,
    }, {
        tableName: 'oa',
        timestamps: true,
        underscored: true,
    })

    return OA
}
