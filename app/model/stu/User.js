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
    // nickname: STRING(64),
    // avatar: STRING(64),
  }, {
    tableName: 'user',
    timestamps: true,
    underscored: true,
  })
  return User
}
