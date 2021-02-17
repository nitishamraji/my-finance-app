'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StocksData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  StocksData.init({
    data: DataTypes.JSON,
    status: DataTypes.STRING,
    statusMsg: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StocksData',
  });
  return StocksData;
};
