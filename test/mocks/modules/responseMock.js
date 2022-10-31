function Response() {
    this.base = {};
    this.viewData = {};
}

Response.prototype = {
    render: function render() {},
    json: function json() {},
    redirect: function redirect(url) {
        this.redirectUrl = url;
    },
    setViewData: function () {},
    setHttpHeader: function () {}
};

module.exports = Response;
