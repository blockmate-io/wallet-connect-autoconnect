# WalletConnect autoconnect

A library for automatic detection of WalletConnect-connected sessions and connecting found addresses
to Blockmate.

## Usage

```js
import WalletConnectAutoconnector from 'wallet-connect-autoconnect';

const WALLET_CONNECT_PROJECT_ID = '<your-walletconnect-project-id>';
const BLOCKMATE_PUBLIC_API_KEY = '<your-blockmate-public-api-key>';
const BLOCKMATE_API_URL = 'https://api.blockmate.io';
const autoconnector = new WalletConnectAutoconnector({
    publicApiKey: BLOCKMATE_PUBLIC_API_KEY,
    blockmateApiUrl: BLOCKMATE_API_URL,
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
});

// const connectedAccounts = await autoconnector.getConnectedAccounts();
await autoconnector.performConnect();
```