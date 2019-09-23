'use strict'

module.exports = app => {
  const { STRING, BLOB } = app.Sequelize

  const User = app.model.define('User', {
    id: {
      type: STRING(32),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    info: BLOB,
  }, {
    tableName: 'user',
    timestamps: true,
    underscored: true,
  })
  User.associate = function() {
    User.hasOne(app.model.Stu.Password)
    User.hasMany(app.model.Stu.UserLoginState)
  }
  return User
}
