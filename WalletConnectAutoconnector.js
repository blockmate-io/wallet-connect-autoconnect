import SignClient from '@walletconnect/sign-client';

class WalletConnectAutoconnector {
	constructor(walletConnectProjectId, walletConnectRelayUrl = 'wss://relay.walletconnect.com') {
		this.walletConnectProjectId = walletConnectProjectId;
		this.walletConnectRelayUrl = walletConnectRelayUrl;
		this.client = undefined;
	}

	async init() {
		this.client = await SignClient.init({
			relayUrl: this.walletConnectRelayUrl,
			projectId: this.walletConnectProjectId,
		});
	}

	async ensureInit() {
		if (!this.client) {
			await this.init();
		}
	}

	async getConnectedAccounts() {
		await this.ensureInit();

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
}

export default WalletConnectAutoconnector;
