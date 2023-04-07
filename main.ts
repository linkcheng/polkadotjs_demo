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

const getExistentialDeposit = async (api: ApiPromise) => {
    const deposit = await api.consts.balances.existentialDeposit.toHuman();
    console.log(`Const existentialDeposit = ${deposit}`);
    return deposit;
};

const getMetadata = async (api: ApiPromise) => {
    const data = await api.rpc.state.getMetadata();
    console.log(`Metadata = ${data}`);
    return data;
};

const printBalance = async (api: ApiPromise, uri: string) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromUri(uri);
    const info = await await api.query.system.account(account.address);
    console.log(`${uri}-balance=${info} ${typeof info}`)
};

const printAliceAndBobBalance = async (api: ApiPromise) => {
    await printBalance(api, '//Alice');
    await printBalance(api, '//Bob');
}

const transfer = async (api: ApiPromise, from: string, to: string, amount: Number) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const fromAcount = keyring.addFromUri(from);
    const toAccount = keyring.addFromUri(to);
    console.log(`Transfer ${from} to ${to} ${amount}`);
    await api.tx.balances.transfer(toAccount.address, amount)
        .signAndSend(fromAcount, res => {
            console.log(`Tx status:${res.status}`);
        });
};

const subscribeAccount = async (api: ApiPromise, uri: string) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromUri(uri);
    await api.query.system.account(account.address, async (acct) => {
        const free = acct.data.free;
        console.log(`${uri} balance:${free.toHuman()}`);
    });
};

const receiveEvent = async (api: ApiPromise) => {
    await api.query.system.events((events) => {
        console.log(`Receive ${events}`);
    });
};

const main = async () => {
    console.log('Start running');
    const api = await connectSubstrate();
    // await getExistentialDeposit(api);
    // var metadata = await getMetadata(api);

    // await printAliceAndBobBalance(api)
    // await transfer(api, '//Alice', '//Bob', 10 ** 12);
    // await subscribeAccount(api, '//Alice');
    // await sleep(6000);
    // await printAliceAndBobBalance(api)


    receiveEvent(api);
    await sleep(600000);
};

main().then(() => {
    console.log('End successful');
    process.exit(0);
}).catch(err => {
    console.log('End error:', err);
    process.exit(1);
});
