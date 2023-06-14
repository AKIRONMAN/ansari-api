const Sequelize = require('sequelize');
const sequelize = require('../database/connection');
module.exports = sequelize.define('Relation', {
    id:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true     
    },
    userId:{    
        type: Sequelize.INTEGER(11),
        foreignKey: true
    },
    relatedToId:{    
        type: Sequelize.INTEGER(11),
        foreignKey: true
    },
    relation: {
        type: Sequelize.ENUM,
        values: ['parent', 'partner', 'guardian'],
        allowNull: false
    },
    createdBy: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        foreignKey: true,
        defaultValue: 1
    },
    modifiedBy: {
        type: Sequelize.INTEGER(11),
        foreignKey: true, 
        defaultValue: 1
    },
    createdAt: Sequelize.DATE,
    modifiedAt: Sequelize.DATE
});


/*
    IF user id is 1 and relatedToId is 2 and relation is "parent"
    then it means 
    1 is parent of 2 
    2 is child of 1
*/
