const express = require('express');
const relation = express.Router();
const userService = require('../services/relation');
const commonService = require('../services/common');

relation.get('/', [relation.getData]);

module.exports = relation;