import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet, ethers, toBeHex } from 'ethers';
import * as msgpack from 'msgpack5';

@Injectable()
export class SigningService {
    private wallet: Wallet;
    private isMainNet: boolean;

    constructor(private configService: ConfigService) {
        const walletPrivateKey = this.configService.get<string>('WALLET_PRIVATE_KEY');
        this.wallet = new Wallet(walletPrivateKey);
        this.isMainNet = this.configService.get<string>('IS_MAIN_NET') === 'true';
    }

    private addressToBytes(address: string): Uint8Array {
        return Buffer.from(address.slice(2), 'hex');
    }

    private actionHash(action: any, nonce: number, vaultAddress: string | null = null): string {
        const encoder = msgpack();
        const data = encoder.encode(action);
        const nonceBytes = ethers.zeroPadValue(ethers.toBeHex(nonce), 8);
        let combinedData = ethers.concat([data, nonceBytes]);

        if (vaultAddress === null) {
            combinedData = ethers.concat([combinedData, Uint8Array.from([0])]);
        } else {
            const vaultAddressBytes = this.addressToBytes(vaultAddress);
            combinedData = ethers.concat([combinedData, Uint8Array.from([1]), vaultAddressBytes]);
        }
        const hashWithPrefix = ethers.keccak256(combinedData);
        return hashWithPrefix;
    }

    private constructPhantomAgent(hash: string) {
        return {
            source: this.isMainNet ? 'a' : 'b',
            connectionId: hash,
        };
    }

    async signL1Action(action: any): Promise<[{ r: string; s: string; v: number }, number]> {
        const nonce = Date.now();
        const hash = this.actionHash(action, nonce);
        const phantomAgent = this.constructPhantomAgent(hash);

        const data = {
            domain: {
                chainId: 1337,
                name: 'Exchange',
                verifyingContract: '0x0000000000000000000000000000000000000000',
                version: '1',
            },
            types: {
                Agent: [
                    { name: 'source', type: 'string' },
                    { name: 'connectionId', type: 'bytes32' },
                ],
            },
            primaryType: 'Agent',
            message: phantomAgent,
        };
        return this.signInner(this.wallet, data, nonce);
    }

    private async signInner(wallet: Wallet, data: any, nonce: number): Promise<[{ r: string; s: string; v: number }, number]> {
        const signature = await wallet.signTypedData(data.domain, data.types, data.message);
        const { r, s, v } = ethers.Signature.from(signature);
        return [{ r: toBeHex(r), s: toBeHex(s), v, }, nonce];
    }

}
