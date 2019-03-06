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
    var args = func.toString().match(/async\s.*?\(([^)]*)\)/)[1];

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

let YourApiKey = "d21b98b09c1b4f1001986401e25a27a07a4673140b5125b81cdfedcea4db9e7b";
let YourSecretKey = "93c30e4a70f5ec3d4427f76602851791aa58fb823773c96cf1347f8b0276b036";
let apiTest = new ApiInstance(YourApiKey, YourSecretKey);

describe("iWan API Auto Test", () => {

    let xlsxHeaderPos = {};
    let testData;
    let header;

    before(async () => {
        await sleep(5000);
    });

    after(() => {
        apiTest.close();
    });

    const workSheet = xlsx.parse(testCaseFile);
    testData = workSheet[xlsxTestCaseIndex].data;

    for (let i = testData.length - 1; i >= 0; i--) {
        if (testData[i].length === 0) {
            testData.splice(i);
        }
    }

    header = testData[0];
    for (let i = 0; i < header.length; i++) {
        for (let key in xlsxHeader) {
            if (header[i] === xlsxHeader[key]) {
                xlsxHeaderPos[key] = i;
            }
        }
    }

    for (let i = 1; i < testData.length; i++) {
    // for (let i = 38; i < 39; i++) {
        if (testData[i].length !== 0 &&
            testData[i][xlsxHeaderPos.flag] !== skipKeyword) {
            let tcid = testData[i][xlsxHeaderPos.tcId];
            let description = testData[i][xlsxHeaderPos.description];
            let api = testData[i][xlsxHeaderPos.apiName];
            let flag = testData[i][xlsxHeaderPos.flag];

            if (apiTest[api]) {
                it("Auto test " + tcid + " " + description, async () => {
                    // try {

                        let sendData = JSON.parse(testData[i][xlsxHeaderPos.input]);
                        let expectResult = JSON.parse(testData[i][xlsxHeaderPos.output]);
                        let args = getArgs(apiTest[api]);
                        let params = [];

                        for (let i = 0; i < args.length; i++) {
                            if (args[i] === "blockHashOrBlockNumber") {
                                if (sendData["params"].hasOwnProperty("blockHash")) {
                                    params.push(sendData["params"]["blockHash"]);
                                } else if (sendData["params"].hasOwnProperty("blockNumber")) {
                                    params.push(sendData["params"]["blockNumber"]);
                                }
                            } else {
                                params.push(sendData["params"][args[i]]);
                            }                            
                        }

                        let assertResult;
                        assertResult = expectResult.hasOwnProperty('error') ? expectResult.error : expectResult.result;

                        let result = await apiTest[api](...params);

                        if (flag === partialKeyword) {
                            if (typeof assertResult === "object") {
                                if (Array.isArray(assertResult)) {
                                    for (let i = 0; i < result.length; i++) {
                                        assert.containsAllKeys(result[i], assertResult[0]);
                                    }                                
                                } else {
                                    assert.containsAllKeys(result, assertResult);
                                }
                            } else {
                                if (expectResult.hasOwnProperty('error')) {
                                    assert.equal(result, assertResult);
                                } else {
                                    assert.equal(typeof result, typeof assertResult);
                                }                                
                            }                            
                        } else {
                            if (Array.isArray(assertResult)) {
                                assert.sameDeepMembers(result, assertResult);
                            } else {
                                assert.deepStrictEqual(result, assertResult);
                            }
                        } 

                    // } catch (err) {
                    //     assert.equal(err, null);
                    // }

                })
            }
        }
    }
});
