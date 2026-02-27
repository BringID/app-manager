# Register a new app

Go to [manager.bringid.org/apps/new](https://manager.bringid.org/apps/new) to open the registration form.

![Registration form with app name and recovery timelock fields](../e2e/screenshots/02-register-app-form.png)

1. Enter an app name.
2. Set the recovery timelock (see below).
3. Click **Register App** and confirm the transaction in your wallet.

## Recovery timelock

Recovery is a timelocked key replacement mechanism. If a user loses access to their wallet, they can re-authenticate through a verification flow to replace their Semaphore identity commitment. The timelock sets a waiting period between initiating and finalizing recovery — during this window the user cannot generate proofs with either the old or new key, which prevents double-spend.

Select a preset from the dropdown or enter a custom value in seconds. Set to 0 to disable recovery for your app. You can change this later in app settings.

## Get your App ID

After the transaction confirms, a success banner displays your new App ID.

![Success banner showing the new App ID](../e2e/screenshots/03b-register-app-success.png)

The App ID is a `0x`-prefixed hex value. Copy it — this is the identifier you pass to the BringID SDK when integrating your app.

## What's next

All app settings — status, recovery timelock, scorer configuration, and admin transfer — can be modified later from the app settings page.

---

Next: [Set custom scores](guide-set-custom-scores.md)
