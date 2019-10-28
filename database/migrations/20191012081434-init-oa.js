
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { DATE, STRING, INTEGER } = Sequelize
        await queryInterface.createTable('oa', {
            id: {
                type: INTEGER,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            title: STRING(255),
            department: STRING(64),
            publish_date: STRING(64),
            created_at: DATE,
            updated_at: DATE,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('oa')
    }
}
