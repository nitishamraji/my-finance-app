'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Messages.init({
    data: DataTypes.JSON,
    helperData: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Messages',
  });
  return Messages;
};
