// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

type cbor = string;
type hex = string;
type Paginate = {
	page: number;
	limit: number;
};

type CoseSign1 = {
	signature: hex;
	key: hex;
};

export type Cardano = {
	getNetworkId(): Promise<number>;
	getUtxos(amount?: cbor, paginate?: Paginate): Promise<cbor[] | undefined>;
	getBalance(): Promise<cbor>;
	getUsedAddresses(paginate?: Paginate): Promise<cbor[]>;
	getUnusedAddresses(): Promise<cbor[]>;

	getChangeAddress(): Promise<cbor>;
	getRewardAddresses(): Promise<cbor[]>;
	signTx(tx: cbor, partialSign: boolean): Promise<cbor>;

	signData(addr: cbor, sigStructure: cbor): Promise<CoseSign1>;
	submitTx(tx: cbor): Promise<hex>;

	getCollateral?: () => Promise<cbor[] | undefined>;

	// NAMI Experimental for now.
	experimental?: {
		on: (
			event: 'networkChange' | 'accountChange',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			handler: (x: any) => void
		) => void;
		off: (
			event: 'networkChange' | 'accountChange',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			handler: (x: any) => void
		) => void;
		getCollateral: () => Promise<cbor[] | undefined>;
	};
};

export type CardanoInitial = {
	enable: () => Promise<Cardano>;
	isEnabled: () => Promise<boolean>;
	apiVersion: string;
	name: string;
	internalName: string;
	icon: string;
};
declare global {
	namespace App {
		interface Platform {
			env: {
				COUNTER: DurableObjectNamespace;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
	interface Window {
		cardano?: { [key in SUPPORTED_WALLETS_TYPE]: CardanoInitial };
	}
}
export {};
