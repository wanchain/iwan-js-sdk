const assert = require('chai').assert;
const xlsx = require('node-xlsx');
const Websocket = require('ws');
const testCaseFile = __dirname + "/testcase/Wanchain RPC API Testcase.xlsx";
const ApiInstance = require('../');

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
                if (typeof(actual[i]) === "object") {
                    assert.containsAllKeys(expect[0], actual[i]);
                } else {
                    assert.equal(typeof(actual[i]), typeof(expect[0]));
                }
                // assert.containsAllKeys(actual[i], expect[0]);
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

let YourApiKey = "adc34f19004447d75c6cccbeb6cd3c52f379134e150c3c85fc34aeb1c9549e72";
let YourSecretKey = "59fcd193d83ca1ed433e61cd9305fabe4effdc24cda00307a0ddbe7629e4cdc8";

describe("iWan API Auto Test", () => {

    let xlsxHeaderPos = {};
    let testData;
    let option = {
        url:"apitest.wanchain.org",
        port:8443
    }
    let apiTest = new ApiInstance(YourApiKey, YourSecretKey, option);

    before(async () => {
        await sleep(2000);
    });


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
            let tcid = row[xlsxHeaderPos.tcId];
            let description = row[xlsxHeaderPos.description];
            let flag = row[xlsxHeaderPos.flag];
            let input = JSON.parse(row[xlsxHeaderPos.input]);
            let api = input["method"];
            let xlsxResult = JSON.parse(row[xlsxHeaderPos.output]);
            let expectResult = xlsxResult.hasOwnProperty('error') ? xlsxResult.error : xlsxResult.result;

            // if (!['TC3001', 'TC3002','TC3003','TC3004','TC3005','TC3006','TC3007', 'TC3008'].includes(tcid)) {
            //     return;
            // }
            it("Auto test promise [" + tcid + " " + description + "]", async () => {
                if (api) {
                    if (apiTest[api]) {
                        let args = getArgs(apiTest[api]);
                        let params = getParams(args, input);;
                        let actualResult = null;

                        try {
                            actualResult = await apiTest[api](...params);
                        } catch (err) {
                            actualResult = (err.hasOwnProperty('error') ? err.error : err);
                        }
                        console.log("Expect:" + JSON.stringify(expectResult) + ", type:" + typeof(expectResult));
                        console.log("Actual:" + JSON.stringify(actualResult) + ", type:" + typeof(actualResult));

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

            it("Auto test callback [" + tcid + " " + description + "]", (done) => {
                if (api) {
                    if (apiTest[api]) {
                        let args = getArgs(apiTest[api]);
                        let params = getParams(args, input);;
                        let actualResult = null;

                        apiTest[api](...params, (err, actualResult) => {
                            if (err) {
                                actualResult = err;
                            }
                            if (flag === partialKeyword) {
                                assertPartialMatch(expectResult, actualResult);
                            } else {
                                assertFullMatch(expectResult, actualResult);
                            } 
                            done();
                        });
                    } else {
                        assertFullMatch("incorrect API name (" + api + ")", "incorrect API name (" + api + ")");
                        done();
                    }
                } else {
                    assertFullMatch("key parameter missing: method", "key parameter missing: method");
                    done();
                }
            });
        }
    });
});
