const routes  = require('express').Router();

const user = require('./user');
const relation = require('./relation');
// const remark = require('./remark');
routes.use('/users', user);
routes.use('/relations', relation);
// routes.use('/remarks', remark);

routes.get('/', (req, res) => {
    res.status(200).json({ message: 'Connected to ansari v1 api!' });
  });

module.exports = routes;





// routes.use('/enquiryTypes', enquiryType);
// routes.use('/branches', branch);
// routes.use('/productTypes', productType);
// routes.use('/status', status);

// const enquiryType = require('./enquiryType');
// const branch = require('./branch');
// const productType = require('./productType');
// const status = require('./status');