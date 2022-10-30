import { useMemo } from "react";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
import { isAddress } from "utils/isAddress";
import { getProviderOrSigner } from "utils";
import { Contract } from "@ethersproject/contracts";
import Web3 from "web3";

// export const useExampleContract = (address: string, withSignerIfPossible = true) => {
//   return useContract(address, ContractAbi, withSignerIfPossible);
// };

// Multiple chains

// export const useBatchTransfer = (withSignerIfPossible?: boolean) => {
//   const { chainId } = useActiveWeb3React();
//   return useContract(getContractAddress(chainId), ContractAbi, withSignerIfPossible);
// };

export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
    const { library, account } = useActiveWeb3React();
    return useMemo(() => {
        if (!address || address === AddressZero || !ABI || !library) return null;
        try {
            return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
        } catch (error) {
            console.error("Failed to get contract", error);
            return null;
        }
    }, [address, ABI, library, withSignerIfPossible, account]);
}

export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`);
    }
    return new Contract(address, ABI, getProviderOrSigner(library, account));
}

export function web3UseConnect(abi: any, address: any) {
    //   const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    window.ethereum.request({ method: "eth_requestAccounts" });

    const web3 = new Web3(window.ethereum);
    return new web3.eth.Contract(abi, address);
};