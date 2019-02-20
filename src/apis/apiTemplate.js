"use strict"
const auth = require('../authorization/auth.js');

let index = 0;

class ApiTemplate {
    constructor(method, parameters, callback) {
        this.message = {
            jsonrpc: "2.0",
            method: method,
            params: parameters,
            id: index
        };
        let jsonResult = auth.JSON(this.message, auth.secretKey);
        if (jsonResult.hasOwnProperty("error")) {
            console.log("Something error happended during auth-JSON", jsonResult.error);
        } else {
            this.message = jsonResult.result;
        }
        this.callback = callback;
        ++index;
    }

    onMessage(message) {
        if(message.hasOwnProperty("error")) {
            this.callback && this.callback(message.error, null);
        } else {
            this.callback && this.callback(null, message.result);
        }
    }
}

module.exports = ApiTemplate;