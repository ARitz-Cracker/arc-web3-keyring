const BufferLib = require("arc-bufferlib");
const {EthereumAccountSignable, InitializeEthereumAccountSignable, rlp} = require("arc-web3-signable-accounts");
const {initializeHDKey, HDKey} = require("hdkey-wasm");
const bip39 = require("bip39-wasm");

let secp256k1 = null;

class EthereumAccountKeyring {
    constructor(entropyOrSeed, wordlist, cache, forceSeed){
        let seedStr;
        this.wordlist = wordlist;
        if (cache){
            this.cache = [];
        }
        if (typeof entropyOrSeed == "string"){
            seedStr = entropyOrSeed;
            try{
                this.entropy = bip39.mnemonicToEntropy(seedStr, wordlist);
            }catch(ex){
                if (forceSeed){
                    this.entropy = null;
                }else{
                    throw ex;
                }
            }
        }else if(entropyOrSeed instanceof Uint8Array){
            seedStr = bip39.entropyToMnemonic(entropyOrSeed, wordlist);
            this.entropy = entropyOrSeed;
        }else if(entropyOrSeed == null){
            this.entropy = BufferLib.allocRandom(32);
            seedStr = bip39.entropyToMnemonic(this.entropy, wordlist);
        }

        let rootestOfRoot = HDKey.fromMasterSeed(bip39.mnemonicToSeed(seedStr));
        this.rootKey = rootestOfRoot.derive(`m/44'/60'/0'/0`);
        rootestOfRoot.wipePrivateData();
    }
    seedWords(){
        if (this.entropy == null){
            throw new Error("Key ring wasn't created with a valid seed.");
        }
        return bip39.entropyToMnemonic(this.entropy, this.wordlist);
    }
    createAccount(connection, index){
        if (this.cache != null){
            if (this.cache[index] != null){
                return this.cache[index];
            }
        }
        let keys = this.rootKey.deriveChild(index);
        let newAccount = new EthereumAccountSignable(connection, keys._privateKey, keys._publicKey);
        if (this.cache != null){
            this.cache[index] = newAccount;
        }
        return newAccount;
    }
    destroy(){
        this.rootKey.wipePrivateData();
    }
}

const InitializeEthereumAccountKeyring = function(s256, s256k1, p) {
    return Promise.all([
        (async () =>{
            secp256k1 = await s256k1;
        })(),
        InitializeEthereumAccountSignable(s256k1),
        initializeHDKey(s256k1, p),
        bip39.initializeBip39(s256, p)
    ]);
}

module.exports = {
    InitializeEthereumAccountKeyring,
    EthereumAccountKeyring,
    EthereumAccountSignable,
    bip39,
    rlp,
    HDKey
}