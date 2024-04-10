"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractProvider = exports.ContractVersion = void 0;
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const process_1 = require("process");
const requireFile = (filename) => {
    return JSON.parse(fs.readFileSync(path_1.default.join((0, process_1.cwd)(), 'shared', 'abi', filename), 'utf8'));
};
const ContractABI = {
    'prod:v4.mainnet': {
        jsonCoreData: requireFile('prod.v4.mainnet.abi.json'),
        jsonViewsData: requireFile('prod.v4.mainnet.views.abi.json'),
    },
    'prod:v4.prater': {
        jsonCoreData: requireFile('prod.v4.prater.abi.json'),
        jsonViewsData: requireFile('prod.v4.prater.views.abi.json'),
    },
    'prod:v4.holesky': {
        jsonCoreData: requireFile('prod.v4.holesky.abi.json'),
        jsonViewsData: requireFile('prod.v4.holesky.views.abi.json'),
    },
    'stage:v4.prater': {
        jsonCoreData: requireFile('stage.v4.prater.abi.json'),
        jsonViewsData: requireFile('stage.v4.prater.views.abi.json'),
    },
    'stage:v4.holesky': {
        jsonCoreData: requireFile('stage.v4.holesky.abi.json'),
        jsonViewsData: requireFile('stage.v4.holesky.views.abi.json'),
    },
};
exports.ContractVersion = {
    MAINNET: 'prod:v4.mainnet',
    PRATER: 'prod:v4.prater',
    HOLESKY: 'prod:v4.holesky',
    PRATER_STAGE: 'stage:v4.prater',
    HOLESKY_STAGE: 'stage:v4.holesky',
};
class ContractProvider {
    constructor(networkAndEnv, nodeUrl) {
        const fullVersion = exports.ContractVersion[networkAndEnv.toUpperCase()];
        const [contractEnv, contractNetwork] = fullVersion.split(':');
        let [version, network] = contractNetwork.split('.');
        version = version.toUpperCase();
        network = network.toUpperCase();
        const result = ContractABI[fullVersion];
        const { jsonCoreData, jsonViewsData } = result;
        // Check if required properties exist in jsonData
        if (!jsonCoreData.contractAddress ||
            !jsonCoreData.abi ||
            !jsonCoreData.genesisBlock) {
            throw new Error(`Missing core data in JSON for ${contractEnv}.${contractNetwork}`);
        }
        // Check if required properties exist in jsonData
        if (!jsonViewsData.contractAddress || !jsonViewsData.abi) {
            throw new Error(`Missing views data in JSON for ${contractEnv}.${contractNetwork}`);
        }
        this.contract = {
            version,
            network,
            address: jsonCoreData.contractAddress,
            addressViews: jsonViewsData.contractAddress,
            abi: jsonCoreData.abi,
            abiViews: jsonViewsData.abi,
            genesisBlock: jsonCoreData.genesisBlock,
        };
        this.web3 = new web3_1.default(nodeUrl);
    }
    get contractAddress() {
        return this.contract.address;
    }
    get abiCore() {
        return this.contract.abi;
    }
    get abiViews() {
        return this.contract.abiViews;
    }
    get contractCore() {
        return new this.web3.eth.Contract(this.abiCore, this.contract.address);
    }
    get contractViews() {
        return new this.web3.eth.Contract(this.abiViews, this.contract.addressViews);
    }
    get genesisBlock() {
        return this.contract.genesisBlock;
    }
}
exports.ContractProvider = ContractProvider;
//# sourceMappingURL=contract.provider.js.map