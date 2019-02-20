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
    let balance = await abiTest.getBalance('WAN', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c');
    console.log("Balance result is ", balance);
    abiTest.close();
}

main();