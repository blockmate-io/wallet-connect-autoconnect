# WalletConnect autoconnect

A library for automatic detection for WalletConnect-connected sessions.

## Usage

```js
import WalletConnectAutoconnector from 'wallet-connect-autoconnect';

const WALLET_CONNECT_PROJECT_ID = '<your-walletconnect-project-id>';
const autoconnector = new WalletConnectAutoconnector(WALLET_CONNECT_PROJECT_ID);

const connectedAccounts = await autoconnector.getConnectedAccounts();
```