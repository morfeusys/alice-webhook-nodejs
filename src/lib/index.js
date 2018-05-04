"use strict";

const actions = require("../webhook.js");

const _hooks = {};
const _regex = {};

function addAction(action, handler) {
    if (typeof action === 'string') {
        _hooks[action] = handler;
    } else if (action instanceof RegExp) {
        _regex[action] = action;
        _hooks[action] = handler;
    } else if (action.length) {
        action.forEach((a) => { _hooks[a] = handler });
    }
}

const registry = {
    on: (...args) => {
        if (args.length > 1) {
            let handler = args[args.length - 1];
            args.slice(0, args.length - 1).forEach((action) => {
                addAction(action, handler);
            });
        }
        return registry;
    }
};

actions(registry);

module.exports = (req) => {
    console.log(JSON.stringify(req));
    var response = { "end_session": false, "text": "", "buttons": [] };
    var res = {"response": response, "session": req['session'], "version": req['version']};

    return new Promise((resolve, reject) => {
        let request = req['request'];
        let command = request['command'];

        var hook = _hooks[command];
        if (!hook) {
            let regexps = Object.keys(_regex);
            for (var i = 0; i < regexps.length; i++) {
                let pattern = regexps[i];
                let regex = _regex[pattern];
                var match = regex.exec(command);
                if (match) {
                    hook = _hooks[pattern];
                    request.match = match;
                    break;
                }
            }
        }
        if (!hook) {
            hook = _hooks['*'];
        }

        if (hook && typeof hook === 'function') {
            request.raw = req;
            var promise = hook.call(this, request, response);

            if (promise && promise.then && typeof promise.then === 'function') {
                promise.then(() => { resolve(res) }, reject);
            } else {
                if (promise && typeof promise === 'string') {
                    response.text = promise;
                }
                resolve(res);
            }
        } else if (hook && typeof hook === 'string') {
            response.text = hook;
            resolve(res);
        } else {
            reject();
        }
    });
};