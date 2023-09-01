import type { TxInput, Value } from '@hyperionbt/helios';

export function coinSelection(TxInputs: TxInput[], target: Value): TxInput[] {
	const selected: Set<TxInput> = new Set();

	// Loop thru the target assets and select any TxInputs that have that asset
	target.assets.mintingPolicies.forEach((policy) => {
		target.assets.getTokenNames(policy).forEach((tokenName) => {
			const quantity = target.assets.get(policy, tokenName);

			// Get all TxInput's that have this token;
			// Sort them by quantity in descending order
			// Select the combination of TxInput's that add up to the quantity we need

			const assetCovered = TxInputs.filter(
				(TxInput) => TxInput.value.assets.get(policy, tokenName) >= 0
			)
				.sort((a, b) =>
					a.value.assets.get(policy, tokenName) > b.value.assets.get(policy, tokenName)
						? -1
						: a.value.assets.get(policy, tokenName) < b.value.assets.get(policy, tokenName)
						? 1
						: 0
				)
				.some((TxInput) => {
					selected.add(TxInput);

					// Check we have selected enough to cover the Asset
					const selectedQty = Array.from(selected).reduce((acc, TxInput) => {
						acc += TxInput.value.assets.get(policy, tokenName);
						return acc;
					}, BigInt(0));

					return selectedQty >= quantity;
				});

			// If the asset is not covered then throw and Not enough coins Error
			if (!assetCovered) {
				throw new Error('Inputs exhausted - ADA');
			}
		});
	});

	// Finally work out if we have enough Lovelace to cover the target
	const selectedLovelace = Array.from(selected).reduce(
		(acc, TxInput) => acc + TxInput.value.lovelace,
		BigInt(0)
	);

	if (target.lovelace > selectedLovelace) {
		// We don't have enough Lovelace, so we need to select some more TxInputs
		let remainingLovelace = target.lovelace - selectedLovelace;

		const selectedRemainingTxInputs = TxInputs.filter((TxInput) => !selected.has(TxInput))
			.sort((a, b) =>
				a.value.lovelace > b.value.lovelace ? -1 : a.value.lovelace < b.value.lovelace ? 1 : 0
			)
			.some((TxInput) => {
				selected.add(TxInput);
				// Reduce Remaining Lovelace
				remainingLovelace -= TxInput.value.lovelace;
				return remainingLovelace <= BigInt(0);
			});

		if (!selectedRemainingTxInputs) {
			throw new Error('Inputs exhausted - Tokens');
		}
	}

	return Array.from(selected);
}
