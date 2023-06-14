const User = require('../models/User');
const Sequelize = require('sequelize');
const sequelize = require('../database/connection');
const sqlService = require('./sql');
const Op = Sequelize.Op;

const moment = require('moment');
const _ = {
    forEach: require('lodash/forEach'),
    cloneDeep: require('lodash/cloneDeep'),
    compact: require('lodash/compact'),
    map: require('lodash/map'),
    merge: require('lodash/merge'),
    assign: require('lodash/assign'),
    find: require('lodash/find')
};
const crypto = require("crypto-js");

const SECRET_KEY = 'qBZ0rexLKPg321fvAqYRqD7LhRpLOIO'; // After dot
const BOT_USER = 9999999999;
const ID_SEPARATOR = 'log-ged-in-user';
const MODULE_TYPE_FIELDS = ['USER', 'CUSTOMER', 'ORGANIZATION', 'PRODUCT'];
const MODULE_FIELDS = {
    USER: 'userId',
    CUSTOMER: 'customerId',
    ORGANIZATION: 'organizationId',
    PRODUCT: 'productId'
};
const BRIDGE_MODULE_FIELDS = {
    USER: 'id',
    CUSTOMER: 'id',
    ORGANIZATION: 'id',
    PRODUCT: 'id'
};
const isUserOrAdmin = (req, res, next) => {
    checkUserPermission(req, res, next, 'isUser', 'isAdmin');
}

const isUser = (req, res, next) => {
    checkUserPermission(req, res, next, 'isUser');
}

const isAdmin = (req, res, next) => {
    checkUserPermission(req, res, next, 'isAdmin');
}

const canAccess = (req, res, next) => {
    console.log("helloo....")
    checkUserPermission(req, res, next, 'canAccess');
}

const isFromAbCrmApi = (req, res, next) => {
    if(req.body.fromAbCrmApi === true && req.body.apiKey === 'VTJGc2RHVmtYMS9UWlFrYzNhNkhvNVNDNmlUMm5Nd2p4TEw2WVhhSnpIbzdHZzIwK2hMdW1iUFRJSWFLeVE3L1NnNTFGTytGdjcyR0lHSEdNZ3NOSWphZG9oNVRxWVRRRnNqRDlpYVpoUGhvcVIwQk9xdmpJZENqWGJPSjV2L2tNNy9uTHJESWdXKzhuU01XdndjaUNQOHltNFdFL2N4TTF5ZTB3aGlhZkd2aHlSU3czRGUxNWJIQko0T0orU21JOWMwMG9xbndvSCtJNWpRZmt0OFh1UT09'){
        next();
    }else {
        sendError('This route is not valid', next);
    }
}

const sendError = (customMessage, next, server = null) => {
    let serverMessage = null;
    if (server && (server.message || server.msg)) {
        serverMessage = server.message || server.msg;
    }
    const error = new Error(JSON.stringify(
        {
            server: serverMessage,
            custom: customMessage
        }));
    next(error);
}

const sendResponse = (res, object, extraObj) => {
    let sendObj = {
        status: 200,
        data: object
    };
    if(extraObj && Object.keys(extraObj).length > 0){
        sendObj = _.merge(sendObj, extraObj);
    }
    res.status(200).send(sendObj);
}

function checkUserPermission(req, res, next) {
    const accessToken = req.headers.accesstoken;
    if (accessToken) {
        User.findOne({
            where: {
                accessToken: accessToken
            }
        }).then((user) => {
            if (user) {
                const userKey = Object.keys(_.cloneDeep(user).dataValues);
                if(!user.dataValues.isActive){
                    sendError('You don\'t have permission to access this data.', next);
                }
                if (!user.dataValues.isSoftDelete ) {
                    if (arguments.length == 5) {
                        if (user.dataValues.role == 'admin') {
                            next();
                        } else {
                            sendError('You don\'t have permission to access this data.', next);
                        }
                    } else if (user[arguments[3]] || (arguments[3] == 'canAccess')) {
                        next();
                    } else {
                        sendError('You don\'t have permission to access this data.', next);
                    }
                } else {
                    sendError('This user is deleted.', next);
                }
            } else {
                sendError('Not found user.', next);
            }
        }).catch((error) => {
            sendError(error, next);
        })
    } else {
        sendError('Please send user accessToken also.', next);
    }
}

const checkRequest = (req, arrayOfAttr) => {
    if (req && req.body && arrayOfAttr) {
        let value = {isProper: true};
        _.forEach(_.cloneDeep(arrayOfAttr), (attr) => {
            if (!req.body[attr] || req.body[attr] == '') {
                value = {isProper: false, attr: attr};
            }
        });
        return value;
    }
    return false;
}

const checkNotNull = (req, arrayOfAttr) => {
    if (req && req.body && arrayOfAttr) {
        let value = {isNotNull: true};
        _.find(_.cloneDeep(arrayOfAttr), (attr) => {
            if (!req.body[attr] || req.body[attr] == '' || req.body[attr] == null) {
                value = {isNotNull: false, attr: attr};
                return true;
            }
        });
        return value;
    }
    return false;
}



const checkRequestNotNull = (req) => {
    if (req && req.body) {
        let value = {isNotNull: true};
        _.find(req.body, (data, key) => {
            if (data == '' || data == null) {
                value = {isNotNull: false, attr: attr};
            }
        });
        return value;
    }
    return false;
}

const getEncryptedMessage = (text) => {
    return Buffer.from(text).toString('base64')
}

const getDecryptedMessage = (encodedText) => {
    return Buffer.from(encodedText, 'base64').toString()
}

const getEncryptedMessageByCrypto = (text) => {
    return crypto.AES.encrypt(text, SECRET_KEY).toString();
}

const getDecryptedMessageByCrypto = (encodedText) => {
    const bytes = crypto.AES.decrypt(encodedText, SECRET_KEY);
    return bytes.toString(crypto.enc.Utf8);
}

const getCurrentUserId = (req) => {
    if(req.body.fromAbCrmApi){
        return BOT_USER;
    }else if(req.headers.accesstoken){
        const encryptedUserId = req.headers.accesstoken.split(ID_SEPARATOR);
        return getDecryptedMessage(encryptedUserId[1]);
    }
    return null;
}

const getDataBySearchTerm = (model, fieldName, term, paginationObj) => {
    return model.findAll({
        where: {
            [fieldName]: {
                [Op.like]: `%${term}%`
            }
        },
        limit: paginationObj.limit || 100,
        offset: paginationObj.offset || 1
    });
}

const getRecordCounts = (req, module, defaultLimit = 20, defaultPage = 1) => {
    let limit = req.query && req.query.limit ? parseInt(req.query.limit) : defaultLimit;
    let page = req.query && req.query.page ? parseInt(req.query.page) : defaultPage;
    let offset = 0;
    let totalCount = 0;
    return module.findAndCountAll()
        .then((data) => {
            totalCount = Math.ceil(data.count / limit);
            offset = limit * (page - 1);
            return {totalCount: data.count, offset: offset, limit: limit};
        });
}



const getSearchableQuery = (object, include) => {
    const directAppliedFilters = ['productType','sellId'];
    const filterObject = {
        where: {
            [object.term.fieldName]: {
                [Op.like]: `%${object.term.value}%`
            }
        }
    };
    if(object.pagination){
        filterObject.limit = object.pagination.limit || 100;
        filterObject.offset = object.pagination.offset || 0
    }
    if(!!include){
        filterObject.include = include;
    }

    _.forEach(directAppliedFilters, (filter) => {
        if(object[filter]){
            filterObject.where[filter] = object[filter];
        }
    });
    return filterObject;


}

// const bulkCreate = (model, arrayItems, createdBy) => {
//     _.forEach(arrayItems, (product, index) => {
//         arrayItems[index].createdBy = createdBy;
//         arrayItems[index].createdAt = moment().format();
//     });
//     return model.bulkCreate(arrayItems)
//         .then((arrayItems) => {
//             const updatePromises = arrayItems.map((item) => {
//                 return item.update({abId: 'PROD' + item.id});
//             });
//             return Promise.all(updatePromises);
//         });
// }

// const setRemark = (data, returnValue) => {
//     if(data && data.remark && data.remark != ''){
//         // data = {sellId:2/ serviceId: 1, remark: Remark}
//         //returnValue is orignal data what we want to send in response
//         return new Promise( async (resolve, reject) => {
//             try{
//                 const remarkData = await Remark.create(data);
//                 return resolve(returnValue);
//             }catch(e){
//                 console.log('Error While creating remark in data: ', data, 'Error:', error);
//                 return resolve(returnValue);
//             }
//         });
//     }else{
//         return new Promise( (resolve, reject) => {
//             return resolve(returnValue);
//         });
//     }
// } 

// getStatusCode = (name) => {
//     const codes = {
//         'associated': 3100,
//         'cantDelete': 3110
//     };
// }

// const runRawQuery = (query) => {
//     return sequelize.query(query);
// }


// const getValidRequestBodyAndCreateSubModuleData = (req, tabelName, moduleName) => {
//     console.log('getValidRequestBodyAndCreateSubModuleData:::', req.body, tabelName, moduleName)
//     let totalCount = 0;
//     let mainModuleData= _.cloneDeep(req.body);
//     return getRecordCounts(req, moduleName)
//     .then((data) => {
//         console.log('getRecordCounts :::', data);
//         totalCount = data.totalCount;
//         return sqlService.getColumnsInTabel(tabelName);
//     })
//     .then((tabelColumns) => {
//         console.log('findColumnsInTabel :::', tabelColumns);
//         const orignalColumns = tabelColumns[0];
//         return getManipulatedData(orignalColumns, req.body, tabelName, totalCount +1);
//     }).then((object) => {
//         console.log('getManipulatedData :::', object);
//         if(object && object.mainModuleData){
//             mainModuleData = _.cloneDeep(object.mainModuleData);
//             if(object.subModuleData && object.subModuleData.length > 0){
//                 return ModuleToModule.bulkCreate(object.subModuleData);
//             }
//             return mainModuleData;
//         }
//         return mainModuleData;
//     }).then((object) => {
//         console.log('bulkCreate :::', object);
//         return mainModuleData;
//     });
// }

// const getValidRequestBodyAndUpdateSubModuleData = (req, tabelName, moduleName) => {
//     console.log('getValidRequestBodyAndUpdateSubModuleData:::', req.body, tabelName, moduleName)
//     let orignalColumns = [];
//     let subModuleArray = [];
//     let subModuleFields = [];
//     let subModuleFieldData = {};
//     let mainModuleData= _.cloneDeep(req.body);
//     let recordId = req.params.id;
//    return sqlService.getColumnsInTabel(tabelName)
//     .then((columns) => {
//         console.log('findColumnsInTabel:::', columns);
//         orignalColumns = columns[0];
//         subModuleArray = findSubModuleFields(orignalColumns, _.cloneDeep(req.body));
//         console.log('findColumnsInTabel:::', subModuleArray);
//         subModuleFields = _.map(subModuleArray, (data) => {return data.fieldId});
//         console.log('findColumnsInTabel:::', subModuleFields);
//         if(subModuleFields && subModuleFields.length == 0){
//             return false;
//         }
//         return sqlService.findOne({
//             where: {id: recordId},
//             attributes: subModuleFields
//         }, tabelName, moduleName);
//     }).then((fieldData) => {
//         if(!fieldData){
//             return false;
//         }
//         console.log('findOne:::', fieldData);
//         subModuleFieldData = _.cloneDeep(fieldData);
//         console.log();
//         if(subModuleFieldData && Object.keys(subModuleFieldData).length > 0){
//             const moduleObject = {};
//             _.forEach(MODULE_FIELDS, (data) => {
//                 moduleObject[data] = {[Op.is]: null};
//             });
//             console.log('MODULE_FIELDS:::', moduleObject);
//             const deleteQueries =  _.map(subModuleArray, (data) => {
//                 const cloneModuleObject = _.cloneDeep(moduleObject);
//                 delete cloneModuleObject[data.subModuleIdLabel];
//                 return {[Op.and]: [{fieldId: subModuleFieldData[data.fieldId]}, cloneModuleObject]};
//             });
//             console.log('deleteQueries:::', JSON.stringify(deleteQueries));
//             if(deleteQueries && deleteQueries.length > 0){
//                 console.log(':::::::::::::::::::::MODULETOMODULE::::::::::::::::::::::');
//                 return ModuleToModule.destroy({
//                     where: {
//                         [Op.or]: deleteQueries
//                     }
//                 });
//             }
//         }
//         return false;
//     }).then((object) => {
//         if(!object){
//             return false;
//         }
//             console.log('destroy:::', object);
//             const subModuleData = [];
//             _.forEach(subModuleFieldData, (subModuleFieldId, mainModuleFieldId) => {
//                 _.forEach(mainModuleData[mainModuleFieldId], (subModuleId) => {
//                         if(subModuleArray[mainModuleFieldId] && subModuleArray[mainModuleFieldId].subModuleIdLabel){
//                             const subModuleIdName = subModuleArray[mainModuleFieldId].subModuleIdLabel;
//                             subModuleData.push({
//                                 fieldId: subModuleFieldId, // Field id for ModuleToModule
//                                 [subModuleIdName]: subModuleId // Sub module id for ModuleToModule like userId: value...
//                             });
//                         }
//                      });
//             });
//             console.log('DATA:::', subModuleData);
//             if(subModuleData && subModuleData.length > 0){
//                 return ModuleToModule.bulkCreate(subModuleData);
//             }
//             return false;
//     }).then((object) => {
//         if(!object){
//             return mainModuleData;
//         }
//         console.log('Modified Sub Module :::', object);
//         _.forEach(subModuleArray, (object, fieldId) => {
//             delete mainModuleData[fieldId];
//         });
//         return mainModuleData;
//     });
// }

// const findSubModuleFields = (orignalColumns, inputFields) => {
//     const fieldArray = Object.keys(inputFields);
//     const origanlFields = _.map(orignalColumns, (field) => {return field.COLUMN_NAME})
//     //Check if input fields exists or not 
//     const notValidFieldData = _.find(fieldArray, (field) => {
//         return !origanlFields.includes(field);
//     });

//     // If a invalid field exist then return as false
//     if(notValidFieldData){
//         return [];
//     }
//     let fieldsObject = {};
//       _.map(fieldArray, (field) => {
//         const splitField = field.split('_');
//         if(splitField && splitField.length > 0
//             && splitField[1] && MODULE_TYPE_FIELDS.includes(splitField[1])){
//                 fieldsObject[field] ={
//                     fieldId: field, 
//                     subModule: splitField[1],
//                     subModuleIdLabel: MODULE_FIELDS[splitField[1]]
//                 };
//                 // abCustom_USER_Field3: {
//                 //    fieldId: abCustom_USER_Field3,
//                 //    subModule: USER,
//                 //    subModuleIdLabel: userId
//                 // }
//             }
//     });
//     return fieldsObject;
// }

// const getManipulatedData = (orignalColumns, inputFields, tabelName, recordCount) => {
//     const fieldArray = Object.keys(inputFields);
//     const origanlFields = _.map(orignalColumns, (field) => {return field.COLUMN_NAME})
//     //Check if input fields exists or not 
//     const notValidFieldData = _.find(fieldArray, (field) => {
//         return !origanlFields.includes(field);
//     });

//     // If a invalid field exist then return as false
//     if(notValidFieldData){
//         return false;
//     }
//     const moduleFields = [];
//     let currentModuleData = {};
//      _.map(fieldArray, (field) => {
//         const splitField = field.split('_');
//         if(splitField && splitField.length > 0
//             && splitField[1] && MODULE_TYPE_FIELDS.includes(splitField[1])){
//                 const moduleNameField = MODULE_FIELDS[splitField[1]];
//                 // Field be like 
//                 // abCustom_USER_Field${counterOfField}_${currentTabelName}_${recordCount}
//                 //Eg: abCustom_USER_Field1_customer_1 
//                 currentModuleData[field] = field + '_' + tabelName + '_' + recordCount;
//                 _.forEach(inputFields[field], (moduleValue) => {
//                     moduleFields.push({
//                         // fieldName: value 
//                         fieldId: currentModuleData[field], // fieldId for ModuleToModule
//                         [moduleNameField]: moduleValue // moduleField
//                     });
//                 });
//         }
//     });
//     const manupulatedRequestData = _.assign(inputFields, currentModuleData);
//     return {mainModuleData: manupulatedRequestData, subModuleData: moduleFields}
// }

// const getCustomFieldRelations = (columns, tabelName) => {
//     const bridgeTabel = {
//         tabelName: 'moduletomodules',
//         joinTabelName: tabelName,
//         bridgeColumnName: 'fieldId',
//         joinName: 'INNER JOIN'
//     };
//     const ownerRelation = {
//         tabelName: 'users',
//         joinTabelName: tabelName,
//         as: 'owner',
//         bridgeColumnName: 'id',
//         joinColumnName: 'ownerId',
//         joinName: 'INNER JOIN'
//     };
//     const relations = [];
//     _.forEach(columns, (field) => {
//         const currentField = field.COLUMN_NAME;
//         const splitField = currentField.split('_');
//         if(splitField && splitField.length > 0
//             && splitField[1] && MODULE_TYPE_FIELDS.includes(splitField[1])){
//                 const bridgeConfig = {...bridgeTabel, joinColumnName: currentField};
//                 relations.push(bridgeConfig);
                
//                 relations.push({
//                     tabelName: splitField[1].toLowerCase() + 's',
//                     joinTabelName: bridgeTabel.tabelName,
//                     bridgeColumnName: BRIDGE_MODULE_FIELDS[splitField[1]],
//                     joinColumnName: MODULE_FIELDS[splitField[1]],
//                     as: 'user',
//                     joinName: 'INNER JOIN',
//                     fieldId: currentField, 
//                     subModule: splitField[1],
//                     subModuleIdLabel: MODULE_FIELDS[splitField[1]]
//                 });
//                 // {
//                 //    fieldId: abCustom_USER_Field3,
//                 //    subModule: USER,
//                 //    subModuleIdLabel: userId
//                 // }
//             }
//     });
//     relations.push(ownerRelation);
//     console.log('Fields:::', relations);
//     return relations;
// }

module.exports = {
    // MODULE_TYPE_FIELDS: MODULE_TYPE_FIELDS,
    // BOT_USER: BOT_USER,
    // getCustomFieldRelations: getCustomFieldRelations,
    // runRawQuery: runRawQuery,
    // getValidRequestBodyAndCreateSubModuleData: getValidRequestBodyAndCreateSubModuleData,
    // getValidRequestBodyAndUpdateSubModuleData: getValidRequestBodyAndUpdateSubModuleData,
    // getManipulatedData: getManipulatedData,
    isUserOrAdmin: isUserOrAdmin,
    isUser: isUser,
    isFromAbCrmApi: isFromAbCrmApi,
    isAdmin: isAdmin,
    sendError: sendError,
    sendResponse: sendResponse,
    checkRequest: checkRequest,
    checkNotNull: checkNotNull,
    canAccess: canAccess,
    getEncryptedMessage: getEncryptedMessage,
    getDecryptedMessage: getDecryptedMessage,
    getEncryptedMessageByCrypto: getEncryptedMessageByCrypto,
    getDecryptedMessageByCrypto: getDecryptedMessageByCrypto,
    getCurrentUserId: getCurrentUserId,
    ID_SEPARATOR: ID_SEPARATOR,
    getRecordCounts: getRecordCounts,
   // bulkCreate: bulkCreate,
    getSearchableQuery: getSearchableQuery,
    // setRemark: setRemark,
    // createFieldInsideModule: createFieldInsideModule,
    // getStatusCode: getStatusCode
};
