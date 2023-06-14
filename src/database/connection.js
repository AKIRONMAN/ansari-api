const Sequelize = require('sequelize');
const config = require('../../config/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {host: config.password, dialect: config.dialect, operatorsAliases: false});
sequelize.sync();
module.exports = sequelize;
global.sequelize = sequelize;