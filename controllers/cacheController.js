//Cache controller to create endpoints that can mimic a cache viewer

const CacheService = require('../services/cache.service');
const cache = new CacheService();

const CacheController = {
    listKeys(req, res, next) {
        try{
            return res.json(cache.keys());
        } catch (err) {
            next(err);
        }
    },

    getKey(req, res, next) {
        try{
            return res.json(cache.load(req.params.key));
        } catch (err) {
            next(err);
        }
    },

    deleteKey(req, res, next) {
        try{
            cache.remove(req.params.key);
            return res.json('removed '+ req.params.key);
        } catch (err) {
            next(err);
        }
    },

    flushCache(req, res, next) {
        try{
            cache.flushAll();
            return res.json('flushed cache');
        } catch (err) {
            next(err);
        }
    },

    getStats(req, res, next) {
        try{
            return res.json(cache.loadStats());
        } catch (err) {
            next(err);
        }
    }
};

module.exports = CacheController;