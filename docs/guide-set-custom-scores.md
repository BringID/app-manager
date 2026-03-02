# Guide: Set custom scores

Deploy a custom scorer and configure per-credential-group scores for your app.

---

## Step 1: Deploy a custom scorer

The Deploy Custom Scorer page (`/apps/{appId}/scorer/deploy`) guides you through a **3-step wizard**:

![Deploy Scorer Wizard](../e2e/screenshots/annotated/05-deploy-scorer.png)

### Step 1a: Deploy scorer contract

Click **Deploy New Scorer**. This deploys a new `DefaultScorer` instance via `ScorerFactory.create()`. Once confirmed, the wizard advances and displays your scorer's contract address.

> **Tip:** If you previously deployed a scorer, it will appear in the "You already have N deployed scorer(s)" section with a **Reuse** button, letting you skip this step.

### Step 1b: Set scorer on app

The wizard shows: *"Scorer deployed at `0x47e5...7bf5`"*

Click **Set App Scorer** to call `CredentialRegistry.setAppScorer(appId, scorerAddress)`. Once confirmed, the wizard advances to Step 3.

### Step 1c: Done

A yellow warning banner indicates:

> **Almost done — set your scores**
> Your custom scorer is deployed but all scores are currently set to **0**. You need to set scores before your app can calculate humanity scores.

Click **Set Scores** to configure your custom scores.

---

## Step 2: Set custom scores

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

Next: [Verify your integration](guide-verify-integration.md)
