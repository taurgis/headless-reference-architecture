'use strict';

function Response() {
    this.base = {};
}

Response.prototype = {
    render: function render() {},
    json: function json() {},
    redirect: function redirect(url) {
        this.redirectUrl = url;
    },
    setViewData: function () {}
};

module.exports = Response;
