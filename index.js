import WalletConnectAutoconnector from "./WalletConnectAutoconnector";
import {providerByChainId} from "./chainMap";

const PUBLIC_TOKEN = 'take_from_endpoint';
const WALLET_CONNECT_PROJECT_ID = '8519c1e1aeaeb073f19c515959919753';
const USER_API_URL = 'https://api.blockmate.io'; // TODO set correctly
const BLOCKMATE_API_URL = 'https://api.blockmate.io';

const autoconnector = new WalletConnectAutoconnector(PUBLIC_TOKEN, WALLET_CONNECT_PROJECT_ID);
const connectedAccounts = await autoconnector.getConnectedAccounts();

// TODO create a user and get a JWT from response (this is just a placeholder code)
const jwt = await fetch(USER_API_URL, {
	method: 'POST',
	body: {
		accounts: connectedAccounts
	}
})

// Use the obtained JWT to connect-new-account
const connectPromises = [];
for (const account of connectedAccounts) {
	const provider = providerByChainId[account.chainId];
	if (provider) {
		connectPromises.push(fetch(
			`${BLOCKMATE_API_URL}/v1/onchain/${provider}/connect`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: {
					wallet: account.address,
					description: account.address
				}
			}
		));
	}
	const result = await Promise.all(connectPromises);
	console.log(`result: ${JSON.stringify(result)}`);
}
