'use strict'

module.exports = app => {
  const { STRING, DATE } = app.Sequelize

  const UserLoginState = app.model.define('UserLoginState', {
    id: {
      type: STRING(32),
      primaryKey: true,
      allowNull: false,
    },
    skey: {
      type: STRING(256),
      primaryKey: true,
      allowNull: false,
    },
    expire_at: {
      type: DATE,
      allowNull: false,
    },
  }, {
    tableName: 'user_login_state',
    timestamps: true,
    underscored: true,
  })

  UserLoginState.associate = function() {
    UserLoginState.belongsTo(app.model.Stu.User, { foreignKey: 'id' })
  }
  return UserLoginState
}
