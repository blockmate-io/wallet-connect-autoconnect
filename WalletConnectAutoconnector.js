import SignClient from '@walletconnect/sign-client';
import { providerByChainId } from "./chainMap.js";

class WalletConnectAutoconnector {
	constructor({
		publicApiKey,
		blockmateApiUrl,
		walletConnectProjectId,
		walletConnectRelayUrl = 'wss://relay.walletconnect.com'
	}) {
		this.publicApiKey = publicApiKey;
		this.blockmateApiUrl = blockmateApiUrl;
		this.walletConnectProjectId = walletConnectProjectId;
		this.walletConnectRelayUrl = walletConnectRelayUrl;
		this.client = undefined;
	}

	async _init() {
		this.client = await SignClient.init({
			relayUrl: this.walletConnectRelayUrl,
			projectId: this.walletConnectProjectId,
		});
	}

	async _ensureInit() {
		if (!this.client) {
			await this._init();
		}
	}

	async getConnectedAccounts() {
		await this._ensureInit();

		const accountsWithDuplicates = this.client.session.getAll().flatMap(session => {
			if (session.expiry < Math.floor(Date.now() / 1000)) {
				return [];
			}

			const accountInfos = [];
			for (const namespaceInfo of Object.values(session.namespaces)) {
				namespaceInfo.accounts.forEach((acc) => {
					const accountDetails = acc.split(':');
					accountInfos.push({
						chainId: `${accountDetails[0]}:${accountDetails[1]}`,
						address: accountDetails[2]
					});
				});
			}
			return accountInfos;
		});

		return Array.from(new Set(accountsWithDuplicates.map(JSON.stringify))).map(JSON.parse);
	}

	async performConnect() {
		const connectedAccounts = await this.getConnectedAccounts();

		const jwtResponse = await fetch(`${this.blockmateApiUrl}/v1/auth/public`, {
			method: 'GET',
			headers: {
				'X-Api-Key': this.publicApiKey,
			}
		});
		const jwt = await jwtResponse.json();

		// Connect all found addresses
		const connectPromises = [];
		for (const account of connectedAccounts) {
			const provider = providerByChainId[account.chainId];
			if (provider) {
				connectPromises.push(fetch(
					`${this.blockmateApiUrl}/v1/onchain/${provider}/connect`,
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${jwt}`,
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							wallet: account.address,
							description: account.address
						})
					}
				));
			}
		}
		await Promise.all(connectPromises);
	}
}

export default WalletConnectAutoconnector;
