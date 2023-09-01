import { Address, Cbor, type PubKeyHash, type StakeKeyHash } from '@hyperionbt/helios';

function makeSplit(lovelace: bigint, pubKeyHash: PubKeyHash, stakingHash?: StakeKeyHash) {
	const token = Cbor.encodeMap([[Cbor.encodeBytes([]), Cbor.encodeInteger(lovelace)]]);

	const value: [number[], number[]] = [
		Cbor.encodeBytes([]), // Policy
		Cbor.encodeConstr(0, [Cbor.encodeInteger(0n), token]) // Token
	];

	//CborData.encodeList([
	return Cbor.encodeConstr(0, [
		Cbor.encodeConstr(0, [
			Cbor.encodeConstr(0, [Cbor.encodeBytes(pubKeyHash.bytes)]), // Encode PubKeyHash of Address
			stakingHash
				? Cbor.encodeConstr(0, [
						Cbor.encodeConstr(0, [Cbor.encodeConstr(0, [Cbor.encodeBytes(stakingHash.bytes)])])
				  ])
				: Cbor.encodeConstr(1, [])
		]),
		Cbor.encodeMap([value]) // Value
	]);
	//]);
}

export function makeDatum(
	ownerAddress: Address,
	jpgStoreAddress: Address | undefined,
	royaltyAddress: Address | undefined,
	payJPG: bigint,
	payRoyalty: bigint,
	payOwner: bigint
) {
	console.log('In makeDatum', {
		ownerAddress,
		jpgStoreAddress,
		royaltyAddress,
		payJPG,
		payRoyalty,
		payOwner
	});

	const ownerPKH = ownerAddress.pubKeyHash || ownerAddress.validatorHash;
	const ownerStakingHash = ownerAddress.stakingHash;
	const jpgPKH = jpgStoreAddress
		? jpgStoreAddress.pubKeyHash || jpgStoreAddress.validatorHash
		: undefined;
	const royaltyPKH = royaltyAddress
		? royaltyAddress.pubKeyHash || royaltyAddress.validatorHash
		: undefined;

	if (!ownerPKH) {
		throw new Error('Invalid Address');
	}

	if (!ownerStakingHash) {
		throw new Error('Invalid Address - No Staking Hash');
	}

	const payoutList = [makeSplit(payOwner, ownerPKH, ownerAddress.stakingHash)];

	if (jpgPKH && payJPG !== 0n) {
		payoutList.push(makeSplit(payJPG, jpgPKH));
	}
	if (royaltyPKH && payRoyalty !== 0n) {
		payoutList.push(makeSplit(payRoyalty, royaltyPKH));
	}

	const cborInt = [Cbor.encodeBytes(ownerPKH.bytes), Cbor.encodeList(payoutList)];
	return Cbor.encodeConstr(0, cborInt);
}
