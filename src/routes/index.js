const routes  = require('express').Router();
const v1Routes = require('./v1-routes');


routes.use('/v1', v1Routes);

routes.get('/', (req, res) => {
    res.status(200).json({ message: 'Connected To ABONLINE apis!' });
  });

module.exports = routes;