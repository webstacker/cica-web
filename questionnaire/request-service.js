'use strict';

const got = require('got');
const merge = require('lodash.merge');

function requestService() {
    function post(options) {
        let opts = {
            method: 'POST',
            headers: {
                accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            },
            json: true,
            body: options.body
        };
        opts = merge(opts, options);
        console.log(
            `11111111111111111111111111111111111111 OUTGOING REQUEST: ${JSON.stringify(
                opts,
                null,
                4
            )}`
        );
        return got(options.url, opts);
    }

    function get(options) {
        let opts = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json'
            },
            json: true
        };
        opts = merge(opts, options);
        const {query} = opts || {};
        console.log(
            `11111111111111111111111111111111111111 OUTGOING REQUEST: ${JSON.stringify(
                opts,
                null,
                4
            )}`
        );
        return got(opts.url, opts, {query});
    }

    return Object.freeze({
        post,
        get
    });
}

module.exports = requestService;
