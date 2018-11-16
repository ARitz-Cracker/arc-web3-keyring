const {
    instantiateSecp256k1,
    instantiateSha256,
    instantiateSha512
} = require("bitcoin-ts");
const {Web3Connection} = require("arc-web3");
const {instantiatePbkdf2} = require("pbkdf2-wasm");

const {
    InitializeEthereumAccountKeyring,
    EthereumAccountKeyring,
} = require(".");
// Initialize keyring library with WASM instances
(async() => {
    await InitializeEthereumAccountKeyring(
        instantiateSha256(),
        instantiateSecp256k1(),
        instantiatePbkdf2(instantiateSha512())
    );
    const web3 = new Web3Connection("http://localhost:8454");
    let accountCreator = new EthereumAccountKeyring("ayy lmao", null, false, true);
    let account = accountCreator.createAccount(web3, 0);

    console.log(account.address);
})();

