const {
    EnigmaUtils, Secp256k1Pen, CosmWasmClient, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey, unmarshalTx
} = require("secretjs");
// } = require("../../EnigmaBlockchain/cosmwasm-js/packages/sdk/build");
const { Slip10RawIndex } = require("@iov/crypto");
const { fromUtf8 } = require("@iov/encoding");
const https = require("https");

require('dotenv').config();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const queryBalance = async (client, address, id, stats) => {
    starttime = Date.now();

    const account = await client.getAccount(address)
        .catch(err => { throw new Error(`Could not get account: ${err}`); });

    const endtime = Date.now();
    const dt = endtime - PROGRAM_START_TIME;
    const latency = endtime - starttime;

    stats.results[id] = {
        dt: latency,
    };
    console.log([dt, latency, id].join(','));

    // console.error(account.balance[0].amount);
}

// const SSCRT_ADDRESS = 'secret1s7c6xp9wltthk5r6mmavql4xld5me3g37guhsx'
// const SSCRT_ADDRESS = 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek'
const SSCRT_ADDRESS = 'secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg'
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

    console.error(id, balance)
    const endtime = Date.now();
    const dt = endtime - PROGRAM_START_TIME;
    const latency = endtime - starttime;

    stats.results[id] = {
        dt: latency,
    };
    console.log([dt, latency, id].join(','));

    // console.error(balance.balance.amount);
}

let PROGRAM_START_TIME = 0;
const main = async () => {
    const url = process.env.SECRET_REST_URL
    const address = process.env.ADDRESS;
    const vk = process.env.SSCRT_VIEWING_KEY;
    const frequency = 500; // per second
    const queries = 500;
    const expectedEndTime = queries / frequency;
    console.error(`querying ${address} at ${url}`)
    console.error(`expected end time = ${expectedEndTime}`);

    const stats = {
        results: []
    };

    const client = new CosmWasmClient(url);
    PROGRAM_START_TIME = Date.now();
    const promises = [];
    for (let i = 0; i < queries; i++) {
        const client = new CosmWasmClient(url);
        // promises.push(queryBalance(client, address, i, stats));
        promises.push(querySNIP20Balance(client, address, vk, i, stats).catch(console.error));
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
