import Web3 from 'web3';
import * as fs from "fs";

const requireFile = (path: string) => {
  return fs.readFileSync(path, 'utf8');
}

type ContractABIType = {
  [key: string]: {
    jsonCoreData: any;
    jsonViewsData: any;
  };
};

const ContractABI : ContractABIType = {
  'prod:v4.mainnet': {
    jsonCoreData: requireFile('../shared/abi/prod.v4.mainnet.abi.json'),
    jsonViewsData: requireFile('../shared/abi/prod.v4.mainnet.views.abi.json'),
  },
  'prod:v4.prater': {
    jsonCoreData: requireFile('../shared/abi/prod.v4.prater.abi.json'),
    jsonViewsData: requireFile('../shared/abi/prod.v4.prater.views.abi.json'),
  },
  'prod:v4.holesky': {
    jsonCoreData: requireFile('../shared/abi/prod.v4.holesky.abi.json'),
    jsonViewsData: requireFile('../shared/abi/prod.v4.holesky.views.abi.json'),
  },
  'stage:v4.prater': {
    jsonCoreData: requireFile('../shared/abi/stage.v4.prater.abi.json'),
    jsonViewsData: requireFile('../shared/abi/stage.v4.prater.views.abi.json'),
  },
  'stage:v4.holesky': {
    jsonCoreData: requireFile('../shared/abi/stage.v4.holesky.abi.json'),
    jsonViewsData: requireFile('../shared/abi/stage.v4.holesky.views.abi.json'),
  },
}


export type NetworkName = string;
export type ContractAddress = string;
export type ContractData = {
  version: string;
  network: string;
  address: ContractAddress;
  addressViews: ContractAddress;
  tokenAddress: string;
  abi: Record<string, any>;
  abiViews: Record<string, any>;
  genesisBlock: number;
};

export const ContractVersion = {
  MAINNET: 'prod:v4.mainnet',
  PRATER: 'prod:v4.prater',
  HOLESKY: 'prod:v4.holesky',
  PRATER_STAGE: 'stage:v4.prater',
  HOLESKY_STAGE: 'stage:v4.holesky',
} as const;

export class ContractProvider {
  private contract: ContractData;
  public web3: Web3;

  constructor(networkAndEnv: string, nodeUrl: string) {

    const [contractEnv, contractNetwork] = ContractVersion[networkAndEnv.toUpperCase() as keyof typeof ContractVersion].split(':');
    let [version, network] = contractNetwork.split('.');
    version = version.toUpperCase();
    network = network.toUpperCase();

    const result = ContractABI[contractNetwork];
    console.log('networkAndEnv', contractNetwork, result)
    const { jsonCoreData, jsonViewsData } = result;

    // Check if required properties exist in jsonData
    if (
      !jsonCoreData.contractAddress ||
      !jsonCoreData.abi ||
      !jsonCoreData.genesisBlock
    ) {
      throw new Error(
        `Missing core data in JSON for ${contractEnv}.${contractNetwork}`,
      );
    }

    // Check if required properties exist in jsonData
    if (!jsonViewsData.contractAddress || !jsonViewsData.abi) {
      throw new Error(
        `Missing views data in JSON for ${contractEnv}.${contractNetwork}`,
      );
    }

    this.contract = <ContractData>{
      version,
      network,
      address: jsonCoreData.contractAddress,
      addressViews: jsonViewsData.contractAddress,
      abi: jsonCoreData.abi,
      abiViews: jsonViewsData.abi,
      genesisBlock: jsonCoreData.genesisBlock,
    };

    this.web3 = new Web3(nodeUrl);
  }

  get contractAddress(): string {
    return this.contract.address
  }

  get abiCore() {
    return this.contract.abi as any;
  }

  get abiViews() {
    return this.contract.abiViews as any;
  }

  get contractCore() {
    return new this.web3.eth.Contract(this.abiCore, this.contract.address);
  }

  get contractViews() {
    return new this.web3.eth.Contract(
      this.abiViews,
      this.contract.addressViews,
    );
  }

  get genesisBlock() {
    return this.contract.genesisBlock;
  }
}
