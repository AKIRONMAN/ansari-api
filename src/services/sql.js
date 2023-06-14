const sequelize = require('../database/connection');

const _ = {
    forEach: require('lodash/forEach'),
    map: require('lodash/map'),
    isArray: require('lodash/isArray'),
    compact: require('lodash/compact'),
    zipObjectDeep: require('lodash/zipObjectDeep'),
    cloneDeep: require('lodash/cloneDeep')
};
const create = (reqBody, tabelName, moduleName) => {
    const data = getQueryFieldsValues(reqBody)
    const dynamicQuery = `INSERT INTO ${tabelName} (${data.fields.join()}) VALUES (${data.values.join()});`;
    console.log('Create:::', dynamicQuery);
    return sequelize.query(dynamicQuery)
    .then((data) => {
        return moduleName.findOne({where: {id: data[0]}});
    });
}

const update = (condition, reqBody, tabelName, moduleName) => {
    const data = getQueryFieldsValues(reqBody, 'update');
    console.log(data);
    const dynamicQuery = `UPDATE 
    ${tabelName} 
    SET ${data.join()}
    WHERE ${condition};`;
    console.log('UPDATE:::', dynamicQuery);
    return sequelize.query(dynamicQuery);
}

const findOne = async (reqBody, tabelName, moduleName) => {
    const object = _.cloneDeep(reqBody);
    let dynamicQuery = '';
    object.logging = (query, queryObject) => {
        dynamicQuery = getDynamicQuery(query);
    }
    moduleName.findOne(object);
    await spleeper(1000);
    return sequelize.query(dynamicQuery).then((data) => {return data[0][0];});
}

const findAll =  (reqBody, tabelName, moduleName) => {
    const object ={..._.cloneDeep(reqBody), tabelName: tabelName};
    console.log(object);
    const columnsQueryArray = _.map(reqBody.includes, (subModule) => {
        return getColumnsInTabel(subModule.tabelName);
    });
    console.log(object);
    return Promise.all(columnsQueryArray)
    .then((columnsArray) => {
        _.forEach(columnsArray, (data, key) => {
            console.log(data)
            object.includes[key].attribuites = {
                includes: _.compact(_.map(data, (attr) => {
                    if(attr.COLUMN_NAME &&
                        !['USER', 'CURRENT_CONNECTIONS', 'TOTAL_CONNECTIONS'].includes(attr.COLUMN_NAME)){
                        return attr.COLUMN_NAME;
                    }
                }))
            };
        });
        return sequelize.query(sqlQueryGenrator(object))
    })
    .then((data) => {
        let currentData = data[0];

        console.log('current::');
        if(data[0] && data[0][0]) {
            try {
                currentData = _.map(data[0], (currentObject) => {
                    const currentKeys = Object.keys(data[0][0]);
                    let vals = Object.values(currentObject);
                    const object = _.zipObjectDeep(currentKeys, vals);
                    delete object.moduletomodules;
                    if(object['user']){
                        delete object['user']['accessToken'];
                        delete object['user']['password'];
                    }
                    if (object['owner']) {
                        delete object['owner']['password'];
                        delete object['owner']['accessToken'];
                    }
                    return object;
                });
            } catch (e) {
                console.log('Error:::', e)
            }
        }
        console.log('current::', currentData);
        return currentData;
    });
}

const find = (reqBody, tabelName, moduleName) => {
    const object = _.cloneDeep(reqBody);
    let dynamicQuery = '';
    object.logging = (query, queryObject) => {
        dynamicQuery = query;
    }
    moduleName.find(object);
    return sequelize.query(dynamicQuery).then((data) => {return data[0];});
}

const spleeper = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
}

const getDynamicQuery = (query) => {
    const orignalString = query.split('(default):');
    return orignalString[1].trim();
}

const getQueryFieldsValues = (reqBody, getFor = 'create') => {
    const fields = [];
    const values = [];
    _.forEach(reqBody, (value, key) => {
        if(getFor == 'create'){
            fields.push(key);
            values.push("'" +  value + "'");
        }else {
            values.push(`${key} = '${value}'`);
        }
    });
    return fields && fields.length > 0 ?{fields: fields, values: values}: values;
}


const sqlQueryGenrator = (object) => {
    let wantAttribuites = [];
    const joins = [];
    const atrribuites = [];
    const groups = [];
    if(object && object.includes && object.includes.length > 0){
        _.forEach(object.includes, (data) => {    
            if(data && data.attribuites && data.attribuites.includes && data.attribuites.includes.length > 0){
                const attrs = _.compact(_.map(data.attribuites.includes, (atrr) => {return `${data.as || data.tabelName}.${atrr} AS '${data.as || data.tabelName}.${atrr}'`}));
                atrribuites.push(...attrs);
            }else {
                atrribuites.push(`${data.as || data.tabelName}.*`);
            }
            groups.push(data.as || data.tabelName);
            joins.push(`${data.joinName ? data.joinName : 'INNER JOIN'} ${data.tabelName} ${data.as ? ' as ' + data.as: ''}
            ON ${ data.joinTabelNameAs || data.joinTabelName}.${data.joinColumnName} = ${data.as || data.tabelName}.${data.bridgeColumnName}`);
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
                console.log('where');
                filterValue = ` ${object.tabelName}.${field} IN(${object.where[field].join()}) `;
            }
            console.log('filterValue:::', filterValue);
            fieldValues.push(filterValue);
        });
        console.log(fieldValues);
        whereCondition += fieldValues.join();
    }
    return `SELECT ${wantAttribuites.join()}
    FROM ${object.tabelName}
    ${joins.join(' ')} 
    ${whereCondition}
    ${object.limit ? 'LIMIT ' + object.limit: ''} 
    ${object.offset ? 'OFFSET ' + object.offset: ''};`;
}

const getColumnsInTabel = (tabelName) => {
    return sequelize
    .query(`SELECT 
    COLUMN_NAME 
    FROM 
    INFORMATION_SCHEMA.COLUMNS 
    WHERE 
    TABLE_NAME = '${tabelName}' 
    ORDER BY ORDINAL_POSITION`)
    .then((tabelColumns) => {
        return tabelColumns[0];
    });
}

module.exports = {
    sqlQueryGenrator: sqlQueryGenrator,
    getColumnsInTabel: getColumnsInTabel,
    create: create,
    find: find,
    update: update,
    findAll: findAll,
    findOne: findOne
};