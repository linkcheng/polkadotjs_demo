import { ApiPromise, WsProvider, Keyring } from "@polkadot/api"

const WEB_SOCKET = 'ws://127.0.0.1:9944';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const connectSubstrate = async () => {
    const wsProvider = new WsProvider(WEB_SOCKET);
    const api = await ApiPromise.create({ provider: wsProvider, types: {} });
    await api.isReady;
    console.log('Connection successfully.');
    return api;
};

const main = async () => {
    console.log('Start running');
    const api = await connectSubstrate();

    const data = await api.rpc.offchain.localStorageGet("PERSISTENT" ,'node-ocw::storage1');  
    console.log(`node-ocw = ${data}`);

    // await sleep(600000);
};

main().then(() => {
    console.log('End successful');
    process.exit(0);
}).catch(err => {
    console.log('End error:', err);
    process.exit(1);
});
