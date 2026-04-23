// TS / ESM
import IwanClient from '../dist/index.js'; // or '../dist/index.cjs'


var YourApiKey = "YOUR_API_KEY";
var YourSecretKey = "YOUR_SECRET_KEY";


async function runTest() {
    try {
        let client = new IwanClient(YourApiKey, YourSecretKey, { isTestnet: true });

        try {
            const blockNumber = await client.getBlockNumber("WAN");
            console.log(`✅ TypeScript Block Number: ${blockNumber}`);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    } catch (e) {
        console.error('❌', e);
    }
}

runTest();