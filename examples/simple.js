//const ApiInstance = require('iwan-sdk');
const ApiInstance = require('../');

async function main() {
    //In order to get an YourApiKey and YourSecretKey, sign up at iWan. Then create a new project to get a new YourApiKey and YourSecretKey key pair.
    //let YourApiKey = "d21b98b09c1b4f1001986401e25a27a07a4673140b5125b81cdfedcea4db9e7b";
    //let YourSecretKey = "93c30e4a70f5ec3d4427f76602851791aa58fb823773c96cf1347f8b0276b036";
    let YourApiKey = "fe087b6462f11bae832a9b397b7f65dddd123b4116932317c77a6a02fd622902";
    let YourSecretKey = "c314dc740b96eca90182ff0788a655a14e57deedfd41e4755169da1f605db2f2";

    //Subject to https://iwan.wanchain.org
    let option = {
      // url:"api.wanchain.org",
      // url:"api2.wanchain.org",
      url:"apitest.wanchain.org",
      //url:"34.215.53.110",
      //url:"52.43.38.37",
      //url:"54.244.217.193",
      // url:"127.0.0.1",
      // url:"52.80.118.234",
      // url:"54.222.242.243",
      port:8443,
      flag:"ws",
      version:"v3",
      timeout: 300000
    };

    let apiTest = new ApiInstance(YourApiKey, YourSecretKey, option);
    
    // apiTest.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c', (err, balance) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("Balance result is ", balance);
    //   }
    // });

    try {
      // let balance = await apiTest.getBalance('WAN', '0x5988635d86a2f30d29127db18B5fC6A3df786F73');
      // console.log("Balance result is ", balance);

      // let wtxinfo = await apiTest.getTxInfo('WAN', '0xbc40a2c161d67ae3fc4580c067c192cb0976bb6699f36b10cfbcb14ff482b53f');
      // console.log("wtxinfo result is ", wtxinfo);

      // let wanTxConfirm = await apiTest.getTransactionConfirm('WAN', 6, '0xbc40a2c161d67ae3fc4580c067c192cb0976bb6699f36b10cfbcb14ff482b53f');
      // console.log('wanTxConfirm result is', JSON.stringify(wanTxConfirm, null, 4));

      // let txinfo = await apiTest.getTxInfo('ETH', '0x13db8f19a915efb24adde80148b46d78622fd55875c22269dfc78d8405c0f085');
      // console.log("txinfo result is ", txinfo);

      // let ethTxConfirm = await apiTest.getTransactionConfirm('ETH', 6, '0x13db8f19a915efb24adde80148b46d78622fd55875c22269dfc78d8405c0f085');
      // console.log('ethTxConfirm result is', ethTxConfirm);

      // let getStoremanGroups = await apiTest.getStoremanGroups('ETH');
      // console.log("getStoremanGroups result is ", getStoremanGroups);

      // let getScEvent = await apiTest.getScEvent("WAN", "0x14caaa533121aa2d5f20253629902132905fe044", ["0x4754d79e46b1343a6941a5ffff26a55ab3c51c5278852adc936941b303f4972b", "0x000000000000000000000000a9a0b81912aa37344db4e183d7773245b0e93be9", "0x5c2ce280ac7a1e6f2e38bf3b8ab3772330d328ab91fe9f679e7485b5ae073666"]);
      // console.log("getScEvent result is ", getScEvent);

      // getScEvent = await apiTest.getScEvent("ETH", "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167", ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]);
      // console.log("getScEvent result is ", getScEvent);

      // getScEvent = await apiTest.getScEvent('WAN', "0xfbaffb655906424d501144eefe35e28753dea037",["0xedcc59255109c84dd5be1380f9fb6a888e7268ecc292b30436c92ae5e2ad4ae0",null,"0x000000000000000000000000a9a0b81912aa37344db4e183d7773245b0e93be9","0x443e7da61875aded7b631aaeedc98df973a33484e3106b2c0c90acc7fab55471"]);
      // console.log("getScEvent result is ", getScEvent);

      // let topics = ["0x9f9db7aab2890dd11e9ef0359c3e13a5cc61aac6de07a5b4e80a750e6083d965", null, 
      // "0x0000000000000000000000008b157b3ffead48c8a4cdc6bddbe1c1d170049da4", "0xa06f2ee4a6726916390b4cd7de80e69a740621893ddc7a4477f4f4fc86e1aa97"];
      // let getethScEvent = await apiTest.getScEvent("ETH", "0x78eb00ec1c005fec86a074060cc1bc7513b1ee88", topics);
      // console.log("getethScEvent result is ", getethScEvent);

      // let getTokenAllowance = await apiTest.getTokenAllowance('ETH', '0xc5bc855056d99ef4bda0a4ae937065315e2ae11a', '0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8', '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1');
      // console.log("getTokenAllowance result is ", getTokenAllowance);

      // let tokenBalance = await apiTest.getTokenBalance('WAN', '0xCC55AAaa675E7f621Ace5bCFF6a3976082FB8768', '0x2839839d1cda0c9eda8a9331cef1c88fd05c9eb6');
      // console.log("token balance is", tokenBalance);

      // let multitokenBalance = await apiTest.getMultiTokenBalance('WAN', ['0x56664f3B65Cc5DAF4098ed10b66C4a86e58e21a4','0xCC55AAaa675E7f621Ace5bCFF6a3976082FB8768'], '0x2839839d1cda0c9eda8a9331cef1c88fd05c9eb6');
      // console.log("multi token balance result is ", multitokenBalance);

      // balance = await apiTest.getBalance('ETH', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c');
      // console.log("Balance result is ", balance);

      // let tokenStoremanGroups = await apiTest.getTokenStoremanGroups('EOS', '0x01800000c2656f73696f2e746f6b656e3a454f53');
      // console.log("getTokenStoremanGroups result is ", tokenStoremanGroups);

      // ******************** POS *********************** //

      // console.time('activity');
      // let activity = await apiTest.getActivity('WAN', 18101);
      // console.timeEnd('activity');
      // console.log("activity result is ", activity);

      // let epoch = await apiTest.getEpochID();
      // console.log("epochID result is ", epoch);

      // console.time('getDelegatorIncentive');
      // let incentive = await apiTest.getDelegatorIncentive('WAN', '0xc21bf6794bbaf0e1a78c5da3f3faa4700400aada');
      // console.log("incentive is ", incentive);
      // console.timeEnd('getDelegatorIncentive');


      // console.time('getDelegatorTotalIncentive');
      // let totalincentive = await apiTest.getDelegatorTotalIncentive('WAN', '0xc21bf6794bbaf0e1a78c5da3f3faa4700400aada');
      // console.log("total incentive is ", totalincentive);
      // console.timeEnd('getDelegatorTotalIncentive');

      // let utxo = await apiTest.getUTXO('BTC', 0, 10000000, ['16uM3baam5cRNgJHpm9aasEW5Wk2a8qC6D']);
      // console.log('utxo result is', utxo);

      // let block = await apiTest.getBlockByNumber('ETH', 9545948);
      // console.log('block result is', block);

      // let block = await apiTest.getBlockByNumber('ETH', 9545948);
      // console.log('block result is', block);

      // let getBlockNumber = await apiTest.getBlockNumber('WAN');
      // console.log('block result is', getBlockNumber);

      // let validatorInfo = await apiTest.getValidatorInfo('WAN', '0xbf12c73ccc1f7f670bf80d0bba93fe5765df9fec');
      // console.log("validator result is ", validatorInfo);

      // ******************** EOS *********************** //
      // let eInfo = await apiTest.getChainInfo('EOS');
      // console.log('einfo result is ', eInfo);

      // let eStat = await apiTest.getStats('EOS', 'eosio.token', 'EOS');
      // console.log('estat result is', eStat);

      // let eAccount = await apiTest.getAccountInfo('EOS', 'aarontestnet');
      // console.log('eAccount result is ', eAccount);

      // let eAccounts = await apiTest.getAccounts('EOS', 'EOS6yEsFdisRXLpk4xg4AEnYJDW5bLrjwBDoHNREsDsxcwFEncErK');
      // console.log("eAccounts result is", eAccounts);

      // eAccounts = await apiTest.getAccounts('EOS', 'aarontestnet');
      // console.log("eAccounts result is", eAccounts);

      // let result1 = await apiTest.getActions('EOS', 'wanchainhtlc', {filter: "wanchainhtlc:outlock", limit: 2});
      // console.log(result1);
      // let result2 = await apiTest.getActions('EOS', 'wanchainhtlc', {indexPos: 8, offset: 2});
      // console.log(result2.length);

      // let eRequirekeys = await apiTest.getRequiredKeys("EOS", {transaction: {
      //   "expiration": '2020-04-03T06:06:41',
      //   "ref_block_num": 15105,
      //   "ref_block_prefix": 2116318876,
      //   "max_net_usage_words": "",
      //   "max_cpu_usage_ms": "",
      //   "delay_sec": 0,
      //   "context_free_actions": [],
      //   "actions": [
      //     {
      //       "account": "eosio.token",
      //       "name": "transfer",
      //       "authorization": [
      //         {
      //           "actor": "cuiqiangtest",
      //           "permission": "active"
      //         }
      //       ],
      //       "data": "90D5CC58E549AF3180626ED39986A6E1010000000000000004454F530000000000"
      //     }
      //   ],
      //   "transaction_extensions": []}, available_keys: ["EOS7MiJnddv2dHhjS82i9SQWMpjLoBbxP1mmpDmwn6ALGz4mpkddv"]});
      //   console.log("eGetrequeirekeys result is ", eRequirekeys);

      // let eRawCodeAndAbi = await apiTest.getRawCodeAndAbi('EOS', 'wanchainhtlc');
      // console.log('eRawCodeAndAbi result is', eRawCodeAndAbi);

      // let eAbi = await apiTest.getAbi('EOS', 'wanchainhtlc');
      // console.log('eABI result is', eAbi);

      // let eRawAbi = await apiTest.getRawAbi('EOS', 'wanchainhtlc');
      // console.log('eRawAbi result is', eRawAbi);

      // let eBalance = await apiTest.getBalance('EOS', 'aaronmainnet');
      // console.log('ebalance is', eBalance);

      // let eTxinfo = await apiTest.getTxInfo('EOS', '5e271aab964830d499ff4c0a19d8810e43f6045e589f19064d6230bf30a27d5d');
      // console.log('eTxinfo result is', eTxinfo);

      // let eBlockNumber = await apiTest.getBlockNumber('EOS');
      // console.log('eBlockNumber result is ', eBlockNumber);

      // let eBlockByNumber = await apiTest.getBlockByNumber('EOS', 84701401);
      // console.log('eBlockByNumber result is ', eBlockByNumber);

      // let eBlockByHash = await apiTest.getBlockByHash('EOS', '050c70d98103d8fd069c84cc97ec5911dd2ca69a75681903f1dde4e2015a186f');
      // console.log('eBlockByHash result is ', eBlockByHash);

      // let eTxReceipt = await apiTest.getTransactionReceipt('EOS', 'f0c6023adc340f21a174eb84d2b34d9c862b94b1b572f140748ac0a606e91913');
      // console.log('eTxReceipt result is', eTxReceipt);

      // let eTxConfirm = await apiTest.getTransactionConfirm('EOS', 6, 'd9f15f654869f0afd957c0bea66eb176f690edbeea78529a8e1c4095acf50136');
      // console.log('eTxConfirm result is', eTxConfirm);

      // let eChainInfo = await apiTest.getChainInfo('EOS');
      // console.log('eChainInfo result is', eChainInfo);



      // let eTable = await apiTest.getTableRows('EOS', 'wanchainhtlc', 'wanchainhtlc', 'transfers')
      // console.log("eTable result is", eTable);

      // let eResource = await apiTest.getResource('EOS');
      // console.log('eResource result is', eResource);

      // let eRamPrice = await apiTest.getRamPrice('EOS');
      // console.log('eRamPrice result is', eRamPrice);

      // let eBandwidth = await apiTest.getBandwidthPrice('EOS', 'junglesweden');
      // console.log('eBandwidth result is', eBandwidth);

      // let eResourcePrice = await apiTest.getResourcePrice('EOS', 'junglesweden');
      // console.log('eResourcePrice result is', eResourcePrice);

      // let eTotalSupply = await apiTest.getTotalSupply('EOS');
      // console.log('eTotalSupply result is', eTotalSupply);

      // let eTotalStake = await apiTest.getTotalStaked('EOS');
      // console.log('eTotalStake result is', eTotalStake);

      // let eTotalStakePercent = await apiTest.getTotalStakedPercent('EOS');
      // console.log('eTotalStakePercent result is', eTotalStakePercent);

      let actions = [
        {
          "account": "eosio",
          "name": "delegatebw",
          "authorization": [
            {
              "actor": "aarontestnet",
              "permission": "active"
            }
          ],
          "data": {
            "from": "aarontestnet",
            "receiver": "aarontestnet",
            "stake_net_quantity": "0.0001 EOS",
            "stake_cpu_quantity": "0.0001 EOS",
            "transfer": false
          }
        }
      ];

      // let ePackresult = await apiTest.packTransaction('EOS', {actions: actions});
      // console.log('ePackresult is ', ePackresult);


      // let ota = await apiTest.getOTAMixSet('0x02539dD49A75d6Cf4c5cc857bc87BC3836E74F1c845A08eC5E009A4dCa59D47C7c0298697d22cfa7d35A670B45C3531ea9D3aAc39E58c929d440Ac1392BDeB8926e7', 8);
      // console.log("ota result is", ota);

      let estimateGas = await apiTest.estimateGas('ETH', {from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      value: '1000000000000000'});
      console.log("estimateGas result is", estimateGas);

    } catch (err) {
      console.log(err);
    }

    apiTest.close();

}

main();
