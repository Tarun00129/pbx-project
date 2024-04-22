class AbstractStore {

    /**
     * @param {Object} store
     */
    constructor(store) {
        this.store = store;
        this.cache = {};  // Associated list of API request Promises
    }

    /*
     * getCacheItem():
     *
     * Returns a cached API request Promise.
     *
     * The purpose of this is to reduce the number of API requests made.
     *
     * By using a promise, cached API requests can be used exactly the same
     * as non-cached API requests. In addition, the caching works for requests
     * which are already in-progress but not yet completed.
     *
     * If the data has been retrieved/cached from a previous
     * request, the returned Promise will already be resolved.
     *
     * Returns null if item is not in cache
     *
     * @param {string} the cache key
     *
     * @return {(Promise|null)}
     */
    getCacheItem = (cacheKey) => {
        if (this.cache.hasOwnProperty(cacheKey)) { // eslint-disable-line no-prototype-builtins
            return this.cache[cacheKey];
        }
        return null;
    };

    /*
     * setCache():
     *
     * Add an API request to the cache.
     *
     * Note that you are not caching the data itself, you are caching a
     * *Promise*. The Promise may or may not have data in it. If the Promise
     * has already been resolved, then there will be data in it, otherwise
     * it may come in at a later time when the request completes.
     *
     * @param {string} Unique identifier for storing/retrieving the cache item.
     * @param {Promise} An API request Promise to cache
     */
    setCache = (cacheKey, promise) => {
        this.cache[cacheKey] = promise;
    };

    /*
     * request():
     *
     * A wrapper function for store requests which adds additional caching
     * feature.
     *
     * 'cacheKey' is required for storing and retrieving the correct data
     * from the cache. The cache key does not have to be unique App-Wide but
     * it does have to be unique within the particular store (Eg. UserStore).
     *
     * A missing cacheKey implies useCache = false, disableCacheUpdate = true.
     *
     * A good format for the cacheKey would be:
     *
     *   cacheKey: `${url}-${resourceId}`,
     *
     * @example for say, UserStore@getUser():
     *
     *   cacheKey: `users-${selUserId}`,
     *
     * @example (full example)```
     *     getUser = selUserId => {
     *         return this.request({
     *             funcRef:            this.store.find,
     *             funcArgs:           [`users/${selUserId}`],
     *             useCache:           true,
     *             cacheKey:           `users/${selUserId}`
     *         });
     *     }
     * ```
     *
     *
     * @param {function} funcRef  - Request function to run
     * @param {array}    funcArgs - Args to pass to 'funcRef'
     * @param {boolean}  useCache - Retrieve from cache (if available)?
     * @param {boolean}  disableCacheUpdate - If true, doesn't update the cache
     * @param {string}   cacheKey - Unique key used to store and retrieve the cache
     *
     * @return {Promise}
     *
     * TODO:
     *    This probably isn't the best solution, but it's a drop-in solution for
     *    supporting caching without making changes to how store.js is used.
     *    A solution that doesn't involve passng a funcRef & funcArgs would be
     *    better (imo).
     */
    request = ({
        funcRef            = () => {},
        funcArgs           = [],
        useCache           = false,
        disableCacheUpdate = false,
        cacheKey           = null
    } = {}) => {
        useCache           = cacheKey ? useCache : false;
        disableCacheUpdate = cacheKey ? disableCacheUpdate : true;
        let cache          = this.getCacheItem(cacheKey);
        let returnPromise  = null;
        if (!useCache || cache === null) { // Not using cache (make request)
            returnPromise = funcRef(...funcArgs);
        } else {
            returnPromise = cache;
        }
        if (!disableCacheUpdate && (!useCache || cache === null)) {
            this.setCache(cacheKey, returnPromise);
        }
        return returnPromise;
    };

}

export default AbstractStore;
