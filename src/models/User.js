const Sequelize = require('sequelize');
const sequelize = require('../database/connection');
module.exports = sequelize.define('User', {
    id:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true     
    },
    dob: {
        type: Sequelize.DATE(),
        allowNull: true
    },
    relationshipStatus: {
        type: Sequelize.ENUM,
        values: ['married', 'widowed', 'divorced', 'never_married'],
        allowNull: false
    },
    education: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    occupation: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    gender: {
        type: Sequelize.ENUM,
        values: ['male', 'female'],
        defaultValue: 'male'
    },
    name: {
        type: Sequelize.STRING(20),
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(30),
        allowNull: true
    },
    role: {
        type: Sequelize.ENUM,
        values: ['admin', 'it', 'member'],
        defaultValue: 'member'
    },
    phone: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    accessToken: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
    },
    city: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    state: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    country: {
        type: Sequelize.STRING(20),
        allowNull: true,
        default: 'India'
    },
    photo: {
        type: Sequelize.STRING(200),
        allowNull: true,
    },
    address: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    status: {
        type: Sequelize.ENUM,
        value: ['active', 'inactive', 'disabled', 'pending', 'email_not_verified', 'deleted'],
        defaultValue: 'pending'
    },
    disabledReason: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    reported: {
        type: Sequelize.JSON(),
        allowNull: true
    },
    createdBy: {
        type: Sequelize.INTEGER(11),
        foreignKey: true,
        defaultValue: '1'
    },
    modifiedBy: {
        type: Sequelize.INTEGER(11),
        foreignKey: true,
        defaultValue: '1'
    },
    loginAt: {
        type: Sequelize.DATE
    },
    createdAt: Sequelize.DATE,
    modifiedAt: Sequelize.DATE
});



/* 



*/