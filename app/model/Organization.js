'use strict'

module.exports = app => {
  const { DATE, STRING, TEXT, INTEGER } = app.Sequelize

  const Organization = app.model.define('Organization', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    organization_name: {
      type: STRING(32),
      allowNull: false,
      unique: true,
    },
    organization_psw: STRING,
    organization_info: TEXT,
    avatar_url: STRING,
    created_at: DATE,
    updated_at: DATE,
  }, {
    tableName: 'organization',
    timestamps: true,
    underscored: true,
  })
  return Organization
}
