const User = require('../models/User');
const Relation = require('../models/Relation');
const commonService = require('./common');
const moment = require('moment');
const SALT = 20;
const _ = {
    cloneDeep: require('lodash/cloneDeep')
}

const getUsers = (req, res, next) => {
    User.findAll()
        .then((users) => {
            commonService.sendResponse(res, users);
        }).catch((error) => {
        commonService.sendError('No users found in data base.', next, error);
    });
}

const getUsersByIds = (req, res, next) => {
    if (req.body.ids) {
        let userIds = req.body.ids;
        if (userIds && userIds.length > 0) {
            User.findAll({
                where: {
                    id: userIds
                }
            }).then((users) => {
                commonService.sendResponse(res, users);
            }).catch((error) => {
                commonService.sendError('No users found in data base.', next, error);
            });
        } else {
            commonService.sendError('Please provide at least one user id.', next);
        }
    } else {
        commonService.sendError('Please provide at least one user id.', next);
    }
}

const createUser = (req, res, next) => {
    console.log('here!!!');
   // const createdBy = commonService.getCurrentUserId(req);
    const request = commonService.checkRequest(req, ['name', 'phone', 'password']);
    if (typeof request == 'object') {
        if (request.isProper) {
            let userObject = req.body;
            //userObject.createdBy = createdBy;
            // const remark = userObject.remark;
            // delete userObject.remark;
            let relationDetails = {
                userId: userObject.userId,
                relation:  userObject.relation
            }
            delete userObject.userId;
            delete userObject.relation;

            console.log(req.body);
            new Promise((resolve, reject) => {
                try {
                    const round1 = commonService.getEncryptedMessage(userObject.password);
                    const round2 = commonService.getEncryptedMessageByCrypto(round1);
                    const round3 = commonService.getEncryptedMessage(round2);
                    resolve(round3);
                } catch (error) {
                    reject(error || 'Hashing is not working.');
                }
            })
                .then((password) => {
                    userObject.password = password;
                    return User.create(userObject);
                }).then(async(user) => {
                    relationDetails.relationToId =   user.dataValues.id;
                    
                    if(relationDetails.userId && relationDetails.relationToId){
                        await Relation.create(relationDetails);
                        return user;
                    }else {
                        return user;
                    }
                })
                
                // .then((user) => {
                //     const data = {createdBy: userObject.createdBy, userId: user.dataValues.id, remark: remark};
                //     return commonService.setRemark(data, user);
                // })
                .then((user) => {
                    commonService.sendResponse(res, user);
                }).catch((error) => {
                    console.log(error);
                commonService.sendError('Issue creating user please try again later.', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to register user.', next);
    }
}
const updateUser = (req, res, next) => {
    const request = commonService.checkNotNull(req, ['name', 'phone', 'password']);
    if (typeof request == 'object') {
        if (request.isNotNull) {
            const accessToken = req.headers.accesstoken;
            const userId = req.params.userId;
            const modifiedBy = commonService.getCurrentUserId(req);
            const userObject = req.body;
            userObject.modifiedBy = modifiedBy;
            // const remark = userObject.remark;
            // delete userObject.remark;
            let relationDetails = {
                userId: userObject.userId,
                relation:  userObject.relation
            }
            delete userObject.userId;
            delete userObject.relation;

            User.findOne({
                where: {id: userId}
            })
                .then((user) => {
                    if (user) {
                        return user.update(userObject);
                    } else {
                        commonService.sendError('There is no user with id = ' + userId, next);
                    }
                }).then(async(user) => {
                    relationDetails.relationToId =   user.dataValues.id;
                    
                    if(relationDetails.userId && relationDetails.relationToId){
                        await Relation.create(relationDetails);
                        return user;
                    }else {
                        return user;
                    }
                })
                
                // .then((user) => {
                //     const data = {createdBy: userObject.createdBy, userId: user.dataValues.id, remark: remark};
                //     return commonService.setRemark(data, user);
                // })
                .then((updateResponse) => {
                    commonService.sendResponse(res, 'User updated successfully.');
                }).catch((error) => {
                commonService.sendError(error, next, error);
            });
        } else {
            commonService.sendError('you have provided this ' + request.attr + ' field as null.', next);
        }
    } else {
        commonService.sendError('Please provide body to update user.', next);
    }
}

const updateUserPassword = (req, res, next) => {
    if (!req.headers.accesstoken) {
        commonService.sendError('Please provide access token.', next);
        return;
    }
    const accessToken = req.headers.accesstoken;
    const parentUserId = commonService.getCurrentUserId(req);
    const userId = req.params.userId;
    const request = commonService.checkRequest(req, ['password']);

    if (typeof request == 'object') {
        if (request.isProper) {
            const userPassword = req.body.password;
            User.findOne({
                where: {id: userId}
            })
                .then(async (user) => {
                    if (user) {
                        let password = userPassword;
                        try {
                            const round1 = commonService.getEncryptedMessage(userPassword);
                            const round2 = commonService.getEncryptedMessageByCrypto(round1);
                            password = commonService.getEncryptedMessage(round2);
                        } catch (error) {
                            commonService.sendError('There is error to update password because of encyption.', next, error);
                            return;
                        }
                        return user.update({password: password, modifiedBy: parentUserId});
                    } else {
                        commonService.sendError('There is no user with id = ' + userId, next);
                    }
                })
                .then((updateResponse) => {
                    commonService.sendResponse(res, 'Password changed successfully.');
                }).catch((error) => {
                commonService.sendError(error, next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide password to update user password.', next);
    }
}

const loginUser = (req, res, next) => {
    console.log('inside login')
    const date = moment().format();
    const request = commonService.checkRequest(req, ['phone', 'password']);
    if (typeof request == 'object') {
        if (request.isProper) {
            User.findOne({
                where: {phone: req.body.phone}
            })
                .then((user) => {
                    if (user) {
                        if(user.dataValues.isSoftDeleted){
                            commonService.sendError('User is deleted please contact your admin.', next);
                            return;
                        }else if(user.dataValues.isActive){
                            commonService.sendError('User is not active contact your admin.', next);
                            return;
                        }
                        console.log('122')
                        return new Promise((resolve, reject) => {
                            try {
                                console.log('123')
                                const round1 = commonService.getDecryptedMessage(user.dataValues.password);
                                const round2 = commonService.getDecryptedMessageByCrypto(round1);
                                const originalPassword = commonService.getDecryptedMessage(round2);
                                console.log(originalPassword);
                                if (originalPassword === req.body.password) {
                                    console.log('124')
                                    resolve(user);
                                } else {
                                    commonService.sendError('You entered password or phone is not correct.', next);
                                }
                            } catch (error) {
                                reject({message: error || 'There is error in encryption.'});
                            }
                        });
                    } else {
                        commonService.sendError('There is no user with id = ' + userId, next);
                    }
                })
                .then((user) => {
                    console.log('2')
                    const accessTokenPrefix = 'AB-' + Math.random();
                    return new Promise((resolve, reject) => {
                        try {
                            const round1 = commonService.getEncryptedMessage(accessTokenPrefix);
                            const round2 = commonService.getEncryptedMessageByCrypto(round1);
                            const hash = commonService.getEncryptedMessage(round2);
                            console.log(hash)
                            resolve({user: user, hash: hash});
                        } catch (error) {
                            reject(error || 'Hashing is not working.');
                        }
                    })
                })
                .then((loginObj) => {
                    console.log(loginObj);
                    const encryptedId = commonService.getEncryptedMessage(loginObj.user.dataValues.id.toString());
                    return loginObj.user.update({
                        loginAt: date,
                        accessToken: loginObj.hash + commonService.ID_SEPARATOR + encryptedId
                    });
                })
                // Todo:: need to pass access token to frontend...
                .then((updateResponse) => {

                    const userResponse = _.cloneDeep(updateResponse);
                    delete userResponse.dataValues['password'];
                    commonService.sendResponse(res, userResponse);
                }).catch((error) => {
                commonService.sendError('Having some issue to please try angain later!', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide password to update user password.', next);
    }
}

const logOutUser = (req, res, next) => {
    const accessToken = req.headers.accesstoken;
    User.findOne({
        where: {accessToken: accessToken}
    })
        .then((user) => {
            return user.update({accessToken: null});
        })
        .then((user) => {
            commonService.sendResponse(res, {message: 'User Logged out successfully.'});
        })
        .catch((error) => {
            commonService.sendError('There is some error please try again.', next, error);
        })
};

const deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    const accessToken = req.headers.accesstoken;
    const parentUserId = commonService.getCurrentUserId(req);
    User.findOne({
        where: {id: userId}
    })
        .then((user) => {
            return user.update({isDeleted: true, modifiedBy: parentUserId});
        })
        .then((user) => {
            commonService.sendResponse(res, 'User deleted successfully.');
        })
        .catch((error) => {
            commonService.sendError('User can\'t deleted.', next, error);
        })
};

module.exports = {
    getUsers: getUsers,
    getUsersByIds: getUsersByIds,
    createUser: createUser,
    updateUser: updateUser,
    updateUserPassword: updateUserPassword,
    loginUser: loginUser,
    deleteUser: deleteUser,
    logOutUser: logOutUser
};