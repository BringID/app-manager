# Register a new app

Go to [manager.bringid.org/apps/new](https://manager.bringid.org/apps/new) to open the registration form.

![Registration form with app name and recovery timelock fields](../e2e/screenshots/02-register-app-form.png)

1. Set the recovery timelock setting.
2. Click **Register App**, this will trigger an onchain transaction to register a new app in the Credential Registry.

**Recovery timelock**

Recovery is a timelocked key replacement mechanism for your users. If a user loses access to their wallet, they can re-authenticate through a verification flow to replace the key. The timelock sets a waiting period between initiating and finalizing recovery — during this window the user cannot generate proofs with either the old or new key, which prevents double-spend.

Choose one of the available options (from 1 day to 1 year) or enter a custom value in seconds. Setting the value to 0 will disable recovery for your app. This setting can be changed later after the app is registered.

## Copy App ID

After the transaction confirms, a success banner displays your new App ID.

![Success banner showing the new App ID](../e2e/screenshots/03b-register-app-success.png)

The App ID is a `0x`-prefixed hex value. Copy it — this is the identifier you pass to the BringID SDK when integrating your app.

## What's next

All app settings — status, recovery timelock, scorer configuration, and admin transfer — can be modified later from the app settings page.

---

Next: [Set custom scores](guide-set-custom-scores.md)
