'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Heatmap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Heatmap.init({
    url: DataTypes.STRING,
    helperData: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Heatmap',
  });
  return Heatmap;
};
