# Guide: Creating an app and setting a custom scorer

Register a new app on the BringID CredentialRegistry and deploy a custom scorer with personalized credential group scores.

---

## Step 1: Register a new app

Click **Register App** in the navigation bar to open the registration form.

![Register App Form](../e2e/screenshots/annotated/02-register-app-form.png)

### Configure the recovery timelock

The **Recovery Timelock** determines how long admin recovery actions take. Choose a preset or enter a custom value in seconds:

| Preset    | Seconds    |
|-----------|------------|
| 1 day     | 86,400     |
| 1 week    | 604,800    |
| 1 month   | 2,592,000  |
| 3 months  | 7,776,000  |
| 6 months  | 15,552,000 |
| 1 year    | 31,536,000 |
| Disabled  | 0          |

Select a timelock value. For this example, we choose **1 day** (86,400 seconds):

![Timelock Selected](../e2e/screenshots/annotated/03-register-app-timelock-selected.png)

### Submit the transaction

Click **Register App** and confirm the transaction in your wallet.

### Success

Once confirmed, a success banner appears showing your new **App ID**:

> **App Registered!**
> Your App ID is **3**
> Save this ID — you'll need it to manage your app.

You'll see two options:
- **Go to App Settings** — navigate to your app's management page
- **Register Another** — register an additional app

Click **Go to App Settings** to continue.

---

## Step 3: View app settings

The App Settings page (`/apps/{appId}`) shows your app's full configuration:

![App Settings](../e2e/screenshots/annotated/04-app-settings.png)

- **Status** — Active or Suspended, with a toggle button
- **Recovery Timelock** — current value with an option to update
- **Admin Transfer** — transfer admin rights to another address (irreversible)
- **Scorer Configuration** — which scorer your app uses

By default, new apps use the **BringID Default Scorer**. To customize scoring, you need to deploy and set a custom scorer.

From the Scorer Configuration section, click **"Set Custom Scores"**.

---

## Step 4: Deploy a custom scorer

The Deploy Custom Scorer page (`/apps/{appId}/scorer/deploy`) guides you through a **3-step wizard**:

![Deploy Scorer Wizard](../e2e/screenshots/annotated/05-deploy-scorer.png)

### Step 4a: Deploy scorer contract

Click **Deploy New Scorer**. This deploys a new `DefaultScorer` instance via `ScorerFactory.create()`. Once confirmed, the wizard advances and displays your scorer's contract address.

> **Tip:** If you previously deployed a scorer, it will appear in the "You already have N deployed scorer(s)" section with a **Reuse** button, letting you skip this step.

### Step 4b: Set scorer on app

The wizard shows: *"Scorer deployed at `0x47e5...7bf5`"*

Click **Set App Scorer** to call `CredentialRegistry.setAppScorer(appId, scorerAddress)`. Once confirmed, the wizard advances to Step 3.

### Step 4c: Done

A yellow warning banner indicates:

> **Almost done — set your scores**
> Your custom scorer is deployed but all scores are currently set to **0**. You need to set scores before your app can calculate humanity scores.

Click **Set Scores** to configure your custom scores.

---

## Step 5: Set custom scores

The Manage Scores page (`/apps/{appId}/scorer/manage`) displays all 15 credential groups in an editable table:

![Manage Custom Scores](../e2e/screenshots/annotated/06-manage-scores.png)


### Edit and save scores

1. Click **Copy defaults** in the Custom Score column header to pre-fill all fields with BringID's default scores, or enter your desired scores manually. For example:
   - Farcaster (Low): `5`
   - Farcaster (Medium): `10`
   - Farcaster (High): `20`

2. The **Save** button updates to show how many scores you've changed: **"Save 3 Score(s)"**

3. Click the Save button. This calls `DefaultScorer.setScores(ids[], scores[])` in a single batch transaction.

4. Confirm the transaction. The table refreshes with your new scores.

> **Reset** — Click the Reset link in the Custom Score column header to discard all unsaved changes.

---

## Step 6: Verify your integration

After saving scores, click **Check Integration** at the bottom of the Manage Scores page. This opens the **SDK Demo** page pre-configured with your app.

![SDK Demo](../e2e/screenshots/annotated/08-demo-page.png)

The Demo page lets you test:

- **verifyHumanity** — Start the BringID humanity verification flow (opens a modal)
- **verifyProofs** — Verify on-chain proofs and see the score breakdown by credential group
