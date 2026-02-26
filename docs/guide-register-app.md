# Register a new app

Register your app on the BringID CredentialRegistry to get an App ID for SDK integration.

## Open the registration form

Click **Register App** in the navigation bar.

![Registration form with app name and recovery timelock fields](../e2e/screenshots/annotated/02-register-app-form.png)

## Configure recovery timelock and submit

The recovery timelock sets how long admin recovery actions take. Select a preset from the dropdown or enter a custom value in seconds.

![Registration form with 1 day timelock selected](../e2e/screenshots/annotated/03-register-app-timelock-selected.png)

Click **Register App** and confirm the transaction in your wallet.

## Registration success

<!-- TODO: capture screenshot of "App Registered!" success banner -->

Once confirmed, a success banner shows your new App ID. Click **Go to App Settings** to continue.

## View app settings

<!-- TODO: capture screenshot of app settings page as admin -->

The app settings page shows your app's configuration:

- **Status** — active or suspended, with a toggle
- **Recovery timelock** — current value, with an option to update
- **Admin transfer** — transfer admin rights to another address
- **Scorer configuration** — which scorer your app uses

New apps use the BringID Default Scorer. To customize scoring, click **Set Custom Scores**.

---

Next: [Set custom scores](guide-set-custom-scores.md)
