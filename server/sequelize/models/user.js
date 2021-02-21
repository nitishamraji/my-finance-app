'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    userId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userName: { type: DataTypes.STRING, allowNull: false },
    role: {type: DataTypes.STRING, allowNull: false, defaultValue: 'standard' },
    approved: {type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    data: {type: DataTypes.JSON },
    helperData: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
