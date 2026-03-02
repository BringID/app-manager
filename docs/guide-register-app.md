# Register a new app

Go to the [BringID App Manager](https://manager.bringid.org/apps/new) to register a new app and get the App ID required for integration.

## Register app onchain

![Registration form with recovery timelock fields](../e2e/screenshots/02-register-app-form.png)

1. Connect a crypto wallet. Your connected wallet becomes the app admin.
2. Set the recovery timelock (see below).
3. Click **Create App** and confirm the transaction in your wallet. Apps are registered onchain in the BringID CredentialRegistry contract.

### Recovery timelock

Recovery lets users replace the key proving ownership of their credentials. If a user loses access to their wallet, they can re-authenticate through a verification flow to link a new key. The timelock sets a waiting period between initiating and finalizing recovery — during this window, the user cannot generate proofs with either key, which prevents double-spend.

Choose a preset (1 day to 1 year) or enter a custom value in seconds. Setting the value to 0 disables key recovery entirely.

The right value depends on how often users interact with your app:

- Faucet dispensing tokens every 24 hours — set to 1 day
- Weekly promotion where unique users register within a week — set to 1 week
- One-time airdrop claimed by unique humans — disable recovery (set to 0)

This setting can be changed later from the app settings page.

## Get App ID

After the transaction confirms, a success banner displays your new App ID.

![Success banner showing the new App ID](../e2e/screenshots/03b-register-app-success.png)

Copy and pass the App ID to the BringID SDK to integrate it with your app.

## What's next

Manage app settings, transfer admin to another wallet, or set custom scores on the settings page.

---

Next: [Set custom scores](guide-set-custom-scores.md)
