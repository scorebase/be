/**
 *
 * @param cb Function to load data if cache miss
 * @param cache Cache to retrieve and set from
 * @param key key to retrieve in cache
 * @returns {Promise<object>} Data
 */
const cacheResponse = async(cache, key, cb) => {
    let data;
    const cached = cache.load(key);
    if(cached) {
        data = cached;
    } else {
        data = await cb();
        cache.insert(key, data);
    }

    return data;
};

module.exports = cacheResponse;