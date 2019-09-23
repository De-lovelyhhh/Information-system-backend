'use strict'

module.exports = app => {
  const { STRING, DATE } = app.Sequelize

  const UserLoginState = app.model.define('UserLoginState', {
    id: {
      type: STRING(32),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    password: {
      type: STRING(256),
      allowNull: false,
    },
    expireAt: {
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
