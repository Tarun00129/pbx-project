import axios from 'axios';
import config from 'src/config/app';
import qs from 'qs';

class Store {

    adapter = null;

    authToken = null;

    constructor(authToken = null) {
        this.authToken = authToken;
        this.adapter = null;
    }

    /**
     * Get Request Adapter.
     *
     * @return {Axios}
     */
    getAdapter = () => {
        if (this.adapter === null) {
            this.adapter = axios.create({
                baseURL: config.apiUri,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(this.authToken ? {
                        Authorization: `Bearer ${this.authToken}`,
                    } : {}),
                },
            });
        }
        return this.adapter;
    };

    /**
     * Handle successful request response.
     *
     * @param {Object} response config, data, headers, request, status. From axios.
     * @return {Promise}
     */
    successHandler = response => Promise.resolve(response.data || {});

    /**
     * Handle request error.
     *
     * @param {Object|String} error
     */
    errorHandler = error => {
        // https://github.com/axios/axios#handling-errors
        if (error.response &&
            error.response.status &&
            error.response.status === 403 &&
            error.response.data &&
            error.response.data.data &&
            error.response.data.data.loginUrl) {
            // User is not authenticated with API. Redirect to login url.
            window.location = error.response.data.data.loginUrl;
            return Promise.resolve();
        }
        // TODO: Other errors. Return new promise with error.response? Log error?
        // For now, return the error as a rejected promise.
        return Promise.reject(error);
    };

    /**
     * Fetch a single resource. Eg "achievement", "tool", "learning item"
     *
     * @param {String} url
     * @param {Object} queryParams
     * @param {Object} options - options for adapter
     *
     * @return {Promise}
     */
    find = (url, queryParams = {}, options = {}) => {
        return this.getAdapter().get(url, {
            params: queryParams,
            ...options,
        })
            .then(this.successHandler)
            .catch(this.errorHandler)
        ;
    };

    /**
     * Fetch an array of resources. Eg "achievements", "tools", "learning items"
     *
     * @param {String} url
     * @param {Object} queryParams
     * @param {Object} options - options for adapter
     *
     * @return {Promise}
     */
    findAll = (url, queryParams = {}, options = {}) => {
        return this.getAdapter().get(url, {
            params: queryParams,
            ...options
        })
            .then(this.successHandler)
            .catch(this.errorHandler)
        ;
    };

    /**
     * Create a resource.
     *
     * @param {String} url
     * @param {Object} data - request body
     * @param {Object} options - options for adapter
     *
     * @return {Promise}
     */
    create = (url, data = {}, options = {}) => {
        // https://github.com/axios/axios#browser
        data = qs.stringify(data);
        return this.getAdapter().post(url, data, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            ...options,
        })
            .then(this.successHandler)
            .catch(this.errorHandler)
        ;
    };

    /**
     * Delete a resource.
     *
     * @param {String} url
     * @param {Object} options - options for adapter
     *
     * @return {Promise}
     */
    delete = (url, options = {}) => {
        return this.getAdapter().delete(url, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            ...options,
        })
            .then(this.successHandler)
            .catch(this.errorHandler)
        ;
    };
}

export default Store;
