const Crypto = require("crypto");
const config = require('../conf/config.js');
const _Encoding = config._Encoding;

function genSignature(_secret, _msg, _encoding) {
    return Crypto.createHmac(_Encoding._enc, _secret).update(_msg).digest(_encoding);
}

function isJSON(obj) {
    let yes = false;

    try {
        JSON.parse(JSON.stringify(obj));
        yes = true;
    } catch (err) {
        yes = false;
    }

    return yes;
}

function checkFormat(obj) {
    let expectKeys = ["jsonrpc", "method", "params", "id"];
    let result = {error:{}};
    let failed = false;

    let actualKeys = Object.keys(obj);
    expectKeys.forEach((k) => {
        if (0 > actualKeys.indexOf(k)) {
            result["error"][k] = "key parameter missing";
            failed = true;
        }
    });
    actualKeys.forEach((k) => {
        if (0 > expectKeys.indexOf(k)) {
            result["error"][k] = "key parameter redundant";
            failed = true;
        }
    });

    if (!failed) {
        delete result["error"];
    }
    return result;
}

function integrateJSON(obj, _secret, _encoding = _Encoding._base64) {
    let result = {}
    let newObj = Object.assign({}, obj);
    let check = checkFormat(newObj);
    if (isJSON(newObj)) {
        if (!check["error"]) {
            newObj["params"]["timestamp"] = Date.now();
            newObj["params"]["signature"] = genSignature(_secret, JSON.stringify(newObj), _encoding);
            result["result"] = newObj;
        } else {
            result["error"] = check["error"];
        }
    } else {
        result["error"] = "the input params <obj> is not JSON object";
    }
    return result;
}

exports.integrateJSON = integrateJSON;
