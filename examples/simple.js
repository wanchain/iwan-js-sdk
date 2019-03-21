const ApiInstance = require('iwan-sdk');

async function main() {
    let YourApiKey = "d21b98b09c1b4f1001986401e25a27a07a4673140b5125b81cdfedcea4db9e7b";
    let YourSecretKey = "93c30e4a70f5ec3d4427f76602851791aa58fb823773c96cf1347f8b0276b036";

    //Subject to https://iwan.wanchain.org
    let option = {
      url:"apitest.wanchain.org",
      port:8443,
      flag:"ws",
      version:"v3"
    };

    let apiTest = new ApiInstance(YourApiKey, YourSecretKey, option);
    
    apiTest.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c', (err, balance) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Balance result is ", balance);
      }
    });

    try {
      let balance = await apiTest.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c');
      console.log("Balance result is ", balance);

      let getStoremanGroups = await apiTest.getStoremanGroups('ETH');
      console.log("getStoremanGroups result is ", getStoremanGroups);

      let getScEvent = await apiTest.getScEvent("WAN", "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167", ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]);
      console.log("getScEvent result is ", getScEvent);

      let getErc20Allowance = await apiTest.getErc20Allowance('ETH', '0xc5bc855056d99ef4bda0a4ae937065315e2ae11a', '0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8', '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1');
      console.log("getErc20Allowance result is ", getErc20Allowance);

      balance = await apiTest.getBalance('ETH', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c');
      console.log(" Balance result is ", balance);
    } catch (err) {
      console.log(err);
    }

    apiTest.close();
}

main();
