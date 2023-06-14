const express = require('express');
const user = express.Router();
const userService = require('../services/user');
const commonService = require('../services/common');

user.get('/all',[commonService.canAccess, userService.getUsers]);

user.get('/', [commonService.canAccess, userService.getUsersByIds]);

user.post('/', [userService.createUser]);

user.put('/:userId/update', [commonService.canAccess, userService.updateUser]);

user.put('/:userId/change-password', [commonService.canAccess, userService.updateUserPassword]);

user.put('/login', [userService.loginUser]);

user.put('/logout', [userService.logOutUser]);

user.delete('/:userId', [commonService.isAdmin, userService.deleteUser]);

module.exports = user;