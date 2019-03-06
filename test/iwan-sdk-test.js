const ApiInstance = require('../src/apis/apiInstance.js');
function sleep(time) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, time);
    })
  }

async function main() {
    let YourApiKey = "d21b98b09c1b4f1001986401e25a27a07a4673140b5125b81cdfedcea4db9e7b";
    let YourSecretKey = "93c30e4a70f5ec3d4427f76602851791aa58fb823773c96cf1347f8b0276b036";
    let apiTest = new ApiInstance(YourApiKey, YourSecretKey);
    await sleep(5000);
    try {
    let balance0 = await apiTest.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c');
    console.log("Balance0 result is ", balance0);

    // let getStoremanGroups = await apiTest.getStoremanGroups('ETH');
    // console.log("getStoremanGroups result is ", getStoremanGroups);

    // let monitorLog = await apiTest.monitorLog('WAN', '0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26', ['0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7']);
    // console.log('monitorLog is ', monitorLog);

    // let getScEvent = await apiTest.getScEvent("WAN", "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167", ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]);
    // console.log("getScEvent result is ", getScEvent);

    // let getErc20Allowance = await apiTest.getErc20Allowance('ETH', '0xc5bc855056d99ef4bda0a4ae937065315e2ae11a', '0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8', '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1');
    // console.log("getErc20Allowance result is ", getErc20Allowance);

    let balance1 = await apiTest.getBalance('ETH', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c');
    console.log("Balance0 result is ", balance1);

    } catch (err) {
      console.log(err);
    }

    apiTest.close();
}

main();