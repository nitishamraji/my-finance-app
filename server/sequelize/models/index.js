'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
const config = require(__dirname + '/../config/config.js')[env];

const db = {};

let sequelize = new Sequelize(process.env.DATABASE_URL, config);
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  console.log('db model name: ' + modelName)
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize.define('StocksLive', {
}, {
  freezeTableName: true
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
