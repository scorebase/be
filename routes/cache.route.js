const express = require('express');
const CacheController = require('../controllers/cacheController');
const { isAdmin } = require('../middlewares/auth.middleware');

const cacheRouter = express.Router();

cacheRouter.use(isAdmin);
cacheRouter.get('/keys', CacheController.listKeys);
cacheRouter.get('/key/:key', CacheController.getKey);
cacheRouter.delete('/key/:key', CacheController.deleteKey);
cacheRouter.delete('/flush', CacheController.flushCache);
cacheRouter.get('/stats', CacheController.getStats);

module.exports = cacheRouter;