const {
    EnigmaUtils, Secp256k1Pen, CosmWasmClient, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey, unmarshalTx
} = require("secretjs");
const { Slip10RawIndex } = require("@iov/crypto");
const { fromUtf8 } = require("@iov/encoding");

require('dotenv').config();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const queryBalance = async (client, address, id, stats) => {
    starttime = Date.now();
    const account = await client.getAccount(address)
        .catch(err => { throw new Error(`Could not get account: ${err}`); });

    endtime = Date.now();
    dt = endtime - starttime;

    stats.results[id] = {
        dt
    };
    console.error('done', dt, id);

    // console.error(account.balance[0].amount);
}

const SSCRT_ADDRESS = 'secret1s7c6xp9wltthk5r6mmavql4xld5me3g37guhsx'
const querySNIP20Balance = async (client, address, vk, id, stats) => {
    starttime = Date.now();
    // console.error('strt', starttime - PROGRAM_START_TIME, id);

    const balanceQuery = {
        balance: {
            key: vk,
            address: address
        }
    };
    let balance = await client.queryContractSmart(SSCRT_ADDRESS, balanceQuery)
        .catch(err => { console.error(`${id} Could not query contract: ${err}`); throw err; });

    const endtime = Date.now();
    const dt = endtime - PROGRAM_START_TIME;
    const latency = endtime - starttime;

    stats.results[id] = {
        dt: latency,
    };
    console.error([dt, latency, id].join(','));

    // console.error(balance.balance.amount);
}

let PROGRAM_START_TIME = 0;
const main = async () => {
    const address = process.env.ADDRESS;
    const vk = process.env.SSCRT_VIEWING_KEY;
    const frequency = 10; // per second
    const queries = 1000;
    const expectedEndTime = queries / frequency;
    console.log(`expected end time = ${expectedEndTime}`);

    const stats = {
        results: []
    };

    const client = new CosmWasmClient(process.env.SECRET_REST_URL);
    PROGRAM_START_TIME = Date.now();
    const promises = [];
    for (let i = 0; i < queries; i++) {
        const client = new CosmWasmClient(process.env.SECRET_REST_URL);
        // promises.push(queryBalance(client, address, i, stats));
        promises.push(querySNIP20Balance(client, address, vk, i, stats));
        // await queryBalance(client, address, i, stats);
        // await querySNIP20Balance(client, address, vk, i, stats);

        await sleep(1000 / frequency);
    }
    await Promise.all(promises);

    const sum = (a, b) => a + b;

    const dts = stats.results.map(result => result.dt);
    console.error(dts);

    const avg = dts.reduce(sum) / stats.results.length;
    const min = Math.min(...dts);
    const max = Math.max(...dts);

    console.error(`${min} * ${avg / min} => ${avg} * ${max / avg} => ${max}`);
}

main().catch(console.error);
