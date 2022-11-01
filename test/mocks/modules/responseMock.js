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
    setHttpHeader: function () {},
    setRedirectStatus: function (status) {
        this.redirectStatus = status;
    }
};

module.exports = Response;
