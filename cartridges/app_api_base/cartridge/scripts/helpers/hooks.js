'use strict';

var HookMgr = require('dw/system/HookMgr');

module.exports = function (hookName, functionName, args) {
    var passedArgs = [];

    if (Array.isArray(args)) {
        passedArgs = args;
    } else if (arguments.length === 4) {
        passedArgs = [args];
    } else {
        passedArgs = Array.prototype.slice.call(arguments, 2, arguments.length - 1);
    }

    if (HookMgr.hasHook(hookName)) {
        return HookMgr.callHook.apply(this, [hookName, functionName].concat(passedArgs));
    }
    return arguments[arguments.length - 1].apply(this, passedArgs);
};
