<script lang="ts">
	import nami from '$lib/images/nami.svg';
	import { coinSelection } from '../lib/CoinSelection';
	import {
		Address,
		Assets,
		MintingPolicyHash,
		PubKeyHash,
		TxInput,
		Value,
		bytesToHex,
		config,
		hexToBytes
	} from '@hyperionbt/helios';
	import Input from '../lib/components/Input.svelte';
	import { makeDatum } from '../lib/Datum';

	let selectedWallet: string = '';
	let policy: string = '39086ef91d452d1b6ea9c8c92a2f3243467ddf93bf7c142d370e7d64';
	let tokenName: string = '43617264616e6f4275647a48325332303131';
	let quantity: number = 1;
	let jpgStorePayout = 0;
	let royaltyPayout = 0;
	let ownerPayout = 0;

	let jpgStoreAddress = Address.fromHashes(
		PubKeyHash.fromHex('11a7d2d41bbf2929f421b07d1df8e53382c970b760a96506720fd824')
	).toBech32();

	let royaltyAddress: string = '';
	let walletAddress: string = '';

	let selectedUTxOs: string[] = [];

	async function selectWallet(wallet: string) {
		if (!window.cardano) {
			console.log('Cardano not loaded yet');
			return;
		}
		const api = await window.cardano[wallet].enable();

		const network = await api.getNetworkId();

		if (network === 0) {
			config.set({
				IS_TESTNET: false		
			})
		}

		const address = await api.getUsedAddresses();
		walletAddress = Address.fromHex(address[0]).toBech32();

		const utxos = await api.getUtxos();
		if (!utxos) {
			console.log('No UTXOs');
			return;
		}
		const hUtxos = utxos.map((u) => TxInput.fromFullCbor(hexToBytes(u)));
		const asset = new Assets();

		asset.addComponent(MintingPolicyHash.fromHex(policy), hexToBytes(tokenName), quantity);

		const targetValue = new Value(5_000_000n, asset);

		console.log(hUtxos.length, JSON.stringify(targetValue.dump()));

		selectedUTxOs = coinSelection(hUtxos, targetValue).map((u) => u.toCborHex());
		console.log(
			walletAddress,
			jpgStoreAddress,
			royaltyAddress,
			jpgStorePayout,
			royaltyPayout,
			ownerPayout
		);

		const datum = makeDatum(
			Address.fromBech32(walletAddress),
			jpgStoreAddress === '' ? undefined : Address.fromBech32(jpgStoreAddress),
			royaltyAddress === '' ? undefined: Address.fromBech32(royaltyAddress),
			BigInt(jpgStorePayout),
			BigInt(royaltyPayout),
			BigInt(ownerPayout)
		);

		console.log(bytesToHex(datum));
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="List on JPG Store" />
</svelte:head>

<section class="mt-6 flex w-full">
	<span class="flex flex-col gap-2 mt-6 w-full">
		<Input label="Policy" bind:value={policy} />
		<Input label="Token Name (HEX)" bind:value={tokenName} />
		<Input label="Quantity" bind:value={quantity} />
	</span>
</section>

<section class="mt-6 flex w-full">
	<span class="flex flex-col gap-2 mt-6 min-w-full">
		<Input label="JPG Store Address" bind:value={jpgStoreAddress} />
		<Input label="JPG Store Payout" bind:value={jpgStorePayout} />
		<Input label="Royalty Address" bind:value={royaltyAddress} />
		<Input label="Royalty Payout" bind:value={royaltyPayout} />

		<Input label="Your Payout" bind:value={ownerPayout} />
	</span>
</section>

<section class="mt-6">
	<span class="btn-group">
		<button on:click={() => selectWallet('nami')} class="btn btn-warning btn-outline">
			<img class="h-full p-2" src={nami} alt="Nami" /> Nami
		</button>
		<button on:click={() => selectWallet('eternl')} class="btn btn-warning btn-outline">
			<img class="h-full p-2" src="https://eternl.io/icons/favicon-128x128.png" alt="Eternl" /> Eternl
		</button>
	</span>
</section>

<section>
	<p>
		{selectedUTxOs.map((u) => {
			u;
		})}
	</p>
</section>
