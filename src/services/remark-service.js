const Remark = require('../models/Remark');
const commonService = require('./../services/common-service');
const moment = require('moment');
const _ = {
    cloneDeep: require('lodash/cloneDeep'),
    merge: require('lodash/merge')
};

const getList = (req, res, next) => {
    Remark.findAll()
        .then((remark) => {
            commonService.sendResponse(res, remark);
        }).catch((error) => {
        commonService.sendError('No remark found in data base.', next, error);
    });
}

const create = (req, res, next) => {
    const createdBy = commonService.getCurrentUserId(req.headers.accesstoken);
    const request = commonService.checkRequest(req, ['remark']);
    if (typeof request == 'object') {
        if (request.isProper) {
            const remarkObject = _.cloneDeep(req.body);
            remarkObject.createdBy = createdBy;
            remarkObject.createdAt = moment().format();
            Remark.create(remarkObject)
                .then((object) => {
                commonService.sendResponse(res, object);
            }).catch((error) => {
                commonService.sendError('Could\'t create remark.', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to create remark.', next);
    }
}

const update = (req, res, next) => {
    if (!req.params.id) {
        commonService.sendError('Please provide id of branch in url.', next);
        return;
    }
    const modifiedBy = commonService.getCurrentUserId(req.headers.accesstoken);
    const request = commonService.checkNotNull(req, ['cityName']);
    if (typeof request == 'object') {
        if (request.isNotNull) {
            const remarkObject = _.cloneDeep(req.body);
            remarkObject.modifiedBy = modifiedBy;
            remarkObject.modifiedAt = moment().format();
            Remark.findOne({
                where: {id: req.params.id}
            })
                .then((remark) => {
                    if (remark) {
                        return remark.update(remarkObject);
                    } else {
                        commonService.sendError('There is no remark with id = ' + req.params.id, next);
                    }
                })
                .then((updateResponse) => {
                    commonService.sendResponse(res, updateResponse);
                }).catch((error) => {
                commonService.sendError('Could not updated', next, error);
            });
        } else {
            commonService.sendError('You have provided this ' + request.attr + ' field as null.', next);
        }
    } else {
        commonService.sendError('Please provide body to update remark.', next);
    }
}

const deleteRemark = (req, res, next) => {
    const id = req.params.id;
    Remark.destroy({
        where: {id: id}
    })
        .then((remark) => {
            commonService.sendResponse(res, 'Remark deleted successfully.');
        })
        .catch((error) => {
            commonService.sendError('Remark can\'t deleted.', next, error);
        })
};

const search = (req, res, next) => {
    let currentObj = {};
            const object = {term: {value: req.query.term || '', fieldName: 'remark'}};
            const filterObject = commonService.getSearchableQuery(object);
    console.log('filterObject::',filterObject)
    Remark.findAll(filterObject).then((remark) => {
            commonService.sendResponse(res, remark, currentObj);
        })
        .catch((error) => {
            commonService.sendError('Can\'t fetched remark.', next, error);
        })
}

module.exports = {
    getList: getList,
    create: create,
    update: update,
    deleteRemark: deleteRemark,
    search: search,
};
