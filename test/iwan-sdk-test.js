const ApiInstance = require('../src/apis/apiInstance.js');
function sleep(time) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, time);
    })
  }

async function main() {
    let abiTest = new ApiInstance();
    await sleep(2000);
    let balance0 = await abiTest.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c');
    console.log("Balance0 result is ", balance0);

    let getStoremanGroups = await abiTest.getStoremanGroups('ETH');
    console.log("getStoremanGroups result is ", getStoremanGroups);

    abiTest.close();
}

main();