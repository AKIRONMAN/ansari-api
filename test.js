const crypto = require("crypto-js");
const SECRET_KEY = 'qBZ0rexLKPg321fvAqYRqD7LhRpLOIO';

const ModuleToModule = require('./src/models/ModuleToModule');
const Sequelize = require('sequelize');
// const { like } = require("sequelize/types/lib/operators");
// const { or, and } = require("sequelize");
//const sequelize = require('./src/database/connection');
const Op = Sequelize.Op;
const _ = {
    map: require('lodash/map'),
    find: require('lodash/find'),
    compact: require('lodash/compact'),
    isArray: require('lodash/isArray'),
    assign: require('lodash/assign'),
    forEach: require('lodash/forEach')
};
const MODULE_TYPE_FIELDS = ['USER', 'CUSTOMER', 'ORGANIZATION', 'PRODUCT'];
const MODULE_FIELDS = {
    USER: 'userId',
    CUSTOMER: 'customerId',
    ORGANIZATION: 'organizationId',
    PRODUCT: 'productId'
};
function convert (pass){
    let data = Buffer.from(pass).toString('base64');
    let round2 = getEncryptedMessageByCrypto(data);
    console.log(Buffer.from(round2).toString('base64'));
}
function getEncryptedMessageByCrypto (text) {
    return crypto.AES.encrypt(text, SECRET_KEY).toString();
}

function convertAb (pass){
    let data = Buffer.from(pass).toString('base64');
    let round2 = getEncryptedMessageByCrypto(data);
    let round3 = getEncryptedMessageByCrypto(round2);
    //console.log(round5);
    console.log(Buffer.from(round3).toString('base64'));
}
convert('12345');

 convertAb('From_AB-crm-API_TO-Control-Master-DATA-Securely');

// const getManipulatedData = (totalFields, inputFields, tabelName, recordId) => {
//     const fieldArray = Object.keys(inputFields);
//     const origanlFields = _.map(totalFields, (field) => {return field.COLUMN_NAME})
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
//                 // abCustom_USER_Field${counterOfField}_${currentTabelName}_${recordId}
//                 //Eg: abCustom_USER_Field1_customer_1 
//                 currentModuleData[field] = field + '_' + tabelName + '_' + recordId;
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

// console.log(getManipulatedData([
//      { COLUMN_NAME: 'ownerId' },
//      { COLUMN_NAME: 'abId' },
//      { COLUMN_NAME: 'customerId' },
//      { COLUMN_NAME: 'productId' },
//      { COLUMN_NAME: 'assignedPersonId' },
//      { COLUMN_NAME: 'supplierId' },
//      { COLUMN_NAME: 'id' },
//      { COLUMN_NAME: 'title' },
//      { COLUMN_NAME: 'pipelineId' },
//      { COLUMN_NAME: 'stage' },
//      { COLUMN_NAME: 'billId' },
//      { COLUMN_NAME: 'orignalRate' },
//      { COLUMN_NAME: 'compayRate' },
//      { COLUMN_NAME: 'createdBy' },
//      { COLUMN_NAME: 'modifiedBy' },
//      { COLUMN_NAME: 'createdAt' },
//      { COLUMN_NAME: 'modifiedAt' },
//      { COLUMN_NAME: 'updatedAt' },
//      { COLUMN_NAME: 'abCustomTEXTField16' },
//      { COLUMN_NAME: 'abCustom_USER_Field19' },
//      { COLUMN_NAME: 'abCustom_PRODUCT_Field20' }
//   ], {abCustomTEXTField16: 'data', orignalRate: 1, abCustom_USER_Field19: [1, 12, 14], abCustom_PRODUCT_Field20: [1, 2,3]}, 'services', 2));

//  // console.log('OBJECT::::::::::::', data);

//  const deleteData = () => {
//     return ModuleToModule.destroy({
//         where: {
//             [Op.or]: [
//                 {
//                     [Op.and]: [
//                         {fieldId: 1}, 
//                         {
//                             productId: {[Op.is]: null},
//                             serviceId: {[Op.is]: null},
//                             sellId: {[Op.is]: null},
//                             organizationId: {[Op.is]: null},
//                             customerId: {[Op.is]: null}
//                         }]
//                 },
//                 {
//                     [Op.and]: [
//                         {fieldId: 2}, 
//                         {
//                             userId: {[Op.is]: null},
//                             serviceId: {[Op.is]: null},
//                             sellId: {[Op.is]: null},
//                             organizationId: {[Op.is]: null},
//                             customerId: {[Op.is]: null}
//                         }]
//                 }
//             ]
            
//         }
//     }).then(() => {});
//  }

//  setTimeout(()=> {
//     deleteData();
// }, 5000);

// let queryString = '';
// const fetchQuery = () => {
//    ModuleToModule.create({fied},{
//         logging: (query, object) => {
//            console.log('DEWEBNHBBEHJBHJBHJ:::::', query);
//             queryString = query;
//         }
//     });
//     return queryString;
// }
// fetchQuery()
// setTimeout(async () => {
//     const orignalString = queryString.split('(default):');
//     console.log('****************************************');
//     console.log(orignalString[1]);
//     console.log('****************************************');
//     const data = await sequelize.query(orignalString[1].trim());

//     console.log('Got Data:::', data);
//    }, 1000)



genrator = (object) => {
    let wantAttribuites = [];
    const joins = [];
    const atrribuites = [];
    if(object && object.includes && object.includes.length > 0){
        _.forEach(object.includes, (data) => {    
            if(data && data.attribuites && data.attribuites.includes && data.attribuites.includes.length > 0){
                const attrs = _.compact(_.map(data.attribuites.includes, (atrr) => {return `${data.tabelName}.${atrr}`}));
                atrribuites.push(...attrs);
            }else {
                atrribuites.push(`${data.tabelName}.*`);
            }
            joins.push(`${data.joinName ? data.joinName : 'INNER JOIN'} ${data.tabelName} ${data.as ? data.as: ''}
            ON ${data.joinTabelName}.${data.mainColumnName} = ${data.tabelName}.${data.bridgeColumnName}`);
        });
    }
    console.log(atrribuites);
    const mainAtrributes = [`${object.tabelName}.*`];
    if(object && object.attribuites && object.attribuites.includes && object.attribuites.includes.length > 0){
        mainAtrributes = _.compact(_.map(object.attribuites.includes, (atrr) => {return `${object.tabelName}.${atrr}`}));
    }
    wantAttribuites = [...mainAtrributes, ...atrribuites];
    let whereCondition = '';
    if(object && object.where){
        const fields = Object.keys(object.where);
        whereCondition = 'WHERE';
        const fieldValues = [];
        _.forEach(fields, (field) => {
            let filterValue = '';
            if(_.isArray(object.where[field])){
                filterValue = ` ${field} IN(${object.where[field].join()}) `;
            }
            fieldValues.push(filterValue);
        });
        console.log(fieldValues);
        whereCondition += fieldValues.join();
    }
    return `SELECT ${wantAttribuites.join()}
    FROM ${object.tabelName}
    ${joins.join(' ')} 
    ${whereCondition};`;
}

/*
console.log(
    genrator(
        {
            tabelName: 'services',
            attribuites: {
                includes: [],
                excludes: []
            },
            where: {
                id: [1, 2, 4]
            },
            getRelation(column, bridgConfig: {tabelName: , columnName: }, tabelName);
            includes: [

                {
                    tabelName: 'moduletomodules',
                    joinTabelName: 'services',
                    bridgeColumnName: 'fieldId',
                    joinColumnName: 'abCustom_USER_Field3',
                    as: 'user',
                    joinName: 'INNER JOIN'
                },
                {
                    tabelName: 'users',
                    joinTabelName: 'moduletomodules',
                    bridgeColumnName: 'userid',
                    mainColumnName: 'id',
                    as: 'user',
                    joinName: 'INNER JOIN',
                    attribuites: {
                        includes: ['id', 'name'],
                        excludes: []
                    }
                }
            ]
        }
    )
);
*/



// SELECT um.id,um.name FROM services ser
// INNER JOIN moduletomodules mtm ON ser.abCustom_USER_Field3 = mtm.fieldId
// INNER JOIN users um ON um.id = mtm.userId
// WHERE (userid IN (1,2,3) OR username IN ('admin','shreyash','amin')) AND usertype = 'admin' AND (cretedby = 1 OR createdAt < CURRENT_DATE) //Little Complex
// userid IN (1,2,3) AND usertype = 'admin' //Simple
// userid IN (1,2,3) OR usertype = 'admin' //Simple
// WHERE (userid IN (1,2,3) AND usertype = 'admin') AND (username IN ('admin','shreyash','amin') OR cretedby = 1 OR createdAt < CURRENT_DATE)


// [
//     {
//         cond:and,
//         array: [
//             {
                
//             }
//         ]
//     },
//     {
//         cond:or,
//         array: [
//             {
                
//             }
//         ]
//     }    
// ]