const assert = require('chai').assert;
const xlsx = require('node-xlsx');
const Websocket = require('ws');
const testCaseFile = __dirname + "/testcase/Wanchain RPC API Testcase.xlsx";
const ApiInstance = require('../src/apis/apiInstance.js');

const xlsxTestCaseIndex = 1;
const skipKeyword = 'skip';
const partialKeyword = 'partial match';
const xlsxHeader = {
    tcId: "ID",
    apiName: "ApiName",
    description: "ApiDescription",
    params: "Params",
    flag: "Flag",
    input: "Input",
    output: "Output"
}

function getArgs(func) {
    var args = func.toString().match(/\s*?\(([^)]*)\)/)[1];

    return args.split(",").map(function (arg) {
        return arg.replace(/\/\*.*\*\//, "").trim();
    }).filter(function (arg) {
        return arg;
    });
}

function sleep(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
}

function getParams(needed, input) {
    let params = [];
    for (let i = 0; i < needed.length; ++i) {
        if (needed[i] === "callback") {
            continue;
        } else if (needed[i] === "addrArray") {
            params.push(input["params"]["address"]);
        } else if (needed[i] === "blockHashOrBlockNumber") {
            if (input["params"].hasOwnProperty("blockHash")) {
                params.push(input["params"]["blockHash"]);
            } else if (input["params"].hasOwnProperty("blockNumber")) {
                params.push(input["params"]["blockNumber"]);
            }
        } else {
            params.push(input["params"][needed[i]]);
        }
    }
    return params;
}

function assertPartialMatch(expect, actual) {
    if (typeof(actual) === "object") {
        if (Array.isArray(actual)) {
            for (let i = 0; i < actual.length; i++) {
                // assert.containsAllKeys(actual[i], assertResult[0]);
                assert.containsAllKeys(actual[i], expect[i]);
            }
        } else {
            assert.containsAllKeys(actual, expect);
        }
    } else {
        if (expect.hasOwnProperty('error')) {
            assert.equal(actual, expect);
        } else {
            assert.equal(typeof(actual), typeof(expect));
        }
    }
}

function assertFullMatch(expect, actual) {
    if (Array.isArray(expect)) {
        assert.sameDeepMembers(actual, expect);
    } else {
        assert.deepStrictEqual(actual, expect);
    }
}

let YourApiKey = "d21b98b09c1b4f1001986401e25a27a07a4673140b5125b81cdfedcea4db9e7b";
let YourSecretKey = "93c30e4a70f5ec3d4427f76602851791aa58fb823773c96cf1347f8b0276b036";

describe("iWan API Auto Test", () => {

    let xlsxHeaderPos = {};
    let testData;
    let apiTest = new ApiInstance(YourApiKey, YourSecretKey);

    after(() => {
        apiTest.close();
    });

    console.log("Auto test file:" + testCaseFile);
    const workSheet = xlsx.parse(testCaseFile);
    testData = workSheet[xlsxTestCaseIndex].data;

    for (let i = testData.length - 1; i >= 0; i--) {
        if (testData[i].length === 0) {
            testData.splice(i);
        }
    }

    let header = testData[0];
    for (let i = 0; i < header.length; i++) {
        for (let key in xlsxHeader) {
            if (header[i] === xlsxHeader[key]) {
                xlsxHeaderPos[key] = i;
            }
        }
    }

    testData.slice(1, testData.length).forEach((row) => {
        if (0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC3002" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC2027" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC1024" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC1025" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC1026" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC1035" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC1036" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
        // if (row[xlsxHeaderPos.tcId] == "TC1037" && 0 < row.length && skipKeyword !== row[xlsxHeaderPos.flag]) {
            let tcid = row[xlsxHeaderPos.tcId];
            let description = row[xlsxHeaderPos.description];
            let input = JSON.parse(row[xlsxHeaderPos.input]);
            let flag = row[xlsxHeaderPos.flag];

            it("Auto test " + tcid + " " + description, async () => {
                let api = input["method"];
                if (api) {
                    if (apiTest[api]) {
                        let xlsxResult = JSON.parse(row[xlsxHeaderPos.output]);
                        let expectResult = xlsxResult.hasOwnProperty('error') ? xlsxResult.error : xlsxResult.result;
                        let args = getArgs(apiTest[api]);
                        let params = getParams(args, input);;
                        let actualResult = null;

                        try {
                            actualResult = await apiTest[api](...params);
                        } catch (err) {
                            actualResult = (err.hasOwnProperty('error') ? err.error : err);
                        }

                        console.log("expect result:" + (typeof(expectResult) === "object" ? JSON.stringify(expectResult) : expectResult) + ", type " + typeof(expectResult));
                        console.log("actual result:" + (typeof(actualResult) === "object" ? JSON.stringify(actualResult) : actualResult) + ", type " + typeof(actualResult));

                        if (flag === partialKeyword) {
                            assertPartialMatch(expectResult, actualResult);
                        } else {
                            assertFullMatch(expectResult, actualResult);
                        } 
                    } else {
                        assertFullMatch("incorrect API name (" + api + ")", "incorrect API name (" + api + ")");
                    }
                } else {
                    assertFullMatch("key parameter missing: method", "key parameter missing: method");
                }
            });
        }
    });
});
