const Crypto = require("crypto");
const config = require('../conf/config.js');
const _Encoding = config._Encoding;

function genSignature(_secret, _msg, _encoding) {
    return Crypto.createHmac(_Encoding._enc, _secret).update(_msg).digest(_encoding);
}

function isJSON(_obj) {
    let _has_keys = 0 ;
    let _failed = false;

    if (typeof _obj === "object") {
        for(let _key in _obj) {
            if (_obj.hasOwnProperty(_key) && !(/^\d+$/.test(_key))) {
                // if (typeof _obj[_key] === "object") {
                //     _failed = isJSON(_obj[_key]);
                // }
                ++_has_keys;
            } else {
                // console.log("isJSON:: invalid key: " + _key);
                _failed = true;
                break;
            }
        }
    } else {
        // console.log("isJSON:: input params is not object");
        _failed = true;
    }

    return (!_failed &&  _has_keys && _obj.constructor == Object && _obj.constructor != Array) ? true : false;
}

function checkFormat(_obj) {
    let _keys = ["jsonrpc", "method", "params", "id"];
    let _result = {ok:false, error:{}};
    let _failed = false;

    // console.log("checkFormat:: _obj");
    // console.log(JSON.stringify(_obj));

    _keys.forEach((_key) => {
        // console.log("check key : " + _key);
        if (!_obj.hasOwnProperty(_key)) {
            // console.log("key parameter missing: " + _key);
            _result.error[_key] = "key parameter missing";
            _failed = true;
        }
    });
    // console.log("check _result : " + JSON.stringify(_result));

    if (!_failed) {
        // console.log("checkFormat succuess");
        _result.ok = true;
        delete _result["error"];
    } else {
        // console.log("checkFormat failed: " + JSON.stringify(_result.error));
    }
    return _result;
}

function integrateJSON(_obj, _secret, _encoding = _Encoding._base64) {
    let _result = {}
    let _json = _obj;
    // if (!isJSON(_json)) {
    //     _result.error = "invalid json format";
    // } else {
    //     console.log("integrateJSON:: input params <_obj> is Object");
    //     let _check = checkFormat(_json);
    //     if (_check.ok) {
    //         _json["params"]["timestamp"] = Date.now();
    //         let sig = genSignature(_secret, JSON.stringify(_json), _encoding);
    //         _json["params"]["signature"] = sig;
    //         _result.result = _json;
    //     } else {
    //         _result.error = _check.error;
    //     }
    // }
    // console.log("integrateJSON:: input params <_obj> is Object");
    let _check = checkFormat(_json);
    if (_check.ok) {
        _json["params"]["timestamp"] = Date.now();
        let sig = genSignature(_secret, JSON.stringify(_json), _encoding);
        _json["params"]["signature"] = sig;
        _result.result = _json;
    } else {
        _result.error = _check.error;
    }
    return _result;
}

exports.JSON = integrateJSON;
exports.secretKey = config.auth.secretKey;