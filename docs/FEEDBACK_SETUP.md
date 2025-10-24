# Feedback Feature - Azure Logic Apps Setup Guide

This guide explains how to set up Azure Logic Apps to receive and process feedback from the OutlookReVision add-in.

## Architecture

```
Frontend (React) → Backend API (.NET) → Azure Logic Apps → Email
```

- **Security**: The Logic Apps endpoint URL is stored securely in the backend configuration
- **Privacy**: User data is only sent to Microsoft Azure services
- **Reliability**: Includes error handling and logging at each layer

## Azure Logic Apps Configuration

### Step 1: Create a Logic App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → **Logic App**
3. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Logic App Name**: `outlookreVision-feedback`
   - **Region**: Choose your preferred region
   - **Plan Type**: Consumption (pay-per-use)
4. Click **Review + Create** → **Create**

### Step 2: Design the Workflow

1. Open your Logic App
2. Click **Logic app designer**
3. Choose **Blank Logic App**

#### Add HTTP Trigger

1. Search for "HTTP" and select **When a HTTP request is received**
2. Click **Use sample payload to generate schema**
3. Paste this JSON schema:

```json
{
  "email": "john.smith@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "message": "Great add-in! Would love to see more languages.",
  "feedbackType": "Feature Request",
  "rating": 5,
  "timestamp": "2025-10-12T14:30:00Z",
  "version": "1.0.0",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "outlookVersion": "16.0.14326.20404",
  "platform": "Windows"
}
```

4. Click **Done** - the schema will be auto-generated

#### Add Send Email Action

1. Click **+ New step**
2. Search for "Office 365 Outlook" and select **Send an email (V2)**
3. Click **Sign in** and authenticate with your Office 365 account
4. Configure the email:

**To**: Your email address (where you want to receive feedback)

**Subject**: Click in the field and build this dynamic content:
```
[@{triggerBody()?['feedbackType']}] ReVision Feedback from @{triggerBody()?['firstName']} @{triggerBody()?['lastName']}
```

**Body**: Switch to **Code View** (click `</>` icon) and paste:

```html
<h2>New Feedback for Outlook ReVision Add-in</h2>

<h3>📋 Feedback Type</h3>
<p><strong>@{triggerBody()?['feedbackType']}</strong></p>

<h3>👤 User Information</h3>
<ul>
  <li><strong>Name:</strong> @{triggerBody()?['firstName']} @{triggerBody()?['lastName']}</li>
  <li><strong>Email:</strong> @{triggerBody()?['email']}</li>
  <li><strong>Rating:</strong> @{triggerBody()?['rating']}/5 ⭐</li>
</ul>

<h3>💬 Message</h3>
<p>@{triggerBody()?['message']}</p>

<h3>🔧 Technical Details</h3>
<ul>
  <li><strong>Timestamp:</strong> @{triggerBody()?['timestamp']}</li>
  <li><strong>Add-in Version:</strong> @{triggerBody()?['version']}</li>
  <li><strong>Platform:</strong> @{triggerBody()?['platform']}</li>
  <li><strong>Outlook Version:</strong> @{triggerBody()?['outlookVersion']}</li>
</ul>

<hr>
<p><em>This feedback was submitted via the ReVision Outlook Add-in feedback form.</em></p>
```

#### Add Response Action (Optional but Recommended)

1. Click **+ New step**
2. Search for "Response" and select **Response**
3. Configure:
   - **Status Code**: `200`
   - **Body**:
   ```json
   {
     "success": true,
     "message": "Feedback received successfully"
   }
   ```

### Step 3: Save and Get the URL

1. Click **Save** at the top
2. Expand the **When a HTTP request is received** trigger
3. Copy the **HTTP POST URL** (it will look like: `https://prod-xx.region.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...`)

⚠️ **IMPORTANT**: Keep this URL secure! Anyone with this URL can send emails.

### Step 4: Configure the Backend

1. Open `src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi/appsettings.json`
2. Update the `LogicApps` section:

```json
{
  "LogicApps": {
    "FeedbackEndpoint": "YOUR_LOGIC_APPS_HTTP_POST_URL_HERE"
  }
}
```

3. For production, use **Azure Key Vault** or **App Configuration** to store this securely:

```json
{
  "LogicApps": {
    "FeedbackEndpoint": "@Microsoft.KeyVault(SecretUri=https://your-keyvault.vault.azure.net/secrets/LogicAppsFeedbackUrl/)"
  }
}
```

### Step 5: Test the Integration

1. Run your backend API
2. Open the add-in
3. Navigate to the **Feedback** tab
4. Fill in the form and submit
5. Check your email inbox for the feedback

## Security Best Practices

### 1. Use Azure Key Vault

Store the Logic Apps URL in Azure Key Vault instead of appsettings.json:

```bash
# Create a secret in Key Vault
az keyvault secret set --vault-name "your-keyvault" --name "LogicAppsFeedbackUrl" --value "YOUR_LOGIC_APPS_URL"
```

### 2. Add Authentication (Recommended for Production)

Instead of using the default SAS token, use Azure AD authentication:

1. In Logic App designer, go to trigger settings
2. Enable **Azure AD OAuth**
3. Update your backend to include Bearer token

### 3. Rate Limiting

Add rate limiting to your backend controller to prevent abuse:

```csharp
[HttpPost("submit")]
[RateLimit(MaxRequests = 5, TimeWindowMinutes = 60)] // Example
public async Task<ActionResult<FeedbackResponse>> SubmitFeedback(...)
```

### 4. Input Validation

The backend already validates input, but you can add additional checks in Logic Apps using **Condition** actions.

### 5. Monitoring

Enable diagnostic logging:

1. Go to your Logic App
2. Click **Diagnostic settings**
3. Add diagnostic setting to send logs to Log Analytics

## Cost Estimation

Azure Logic Apps (Consumption Plan):
- **Triggers**: ~$0.000025 per execution
- **Actions**: ~$0.000125 per action (2 actions = Send Email + Response)
- **Estimated cost**: ~$0.0002 per feedback submission

For 1,000 feedback submissions/month: **~$0.20/month**

## Troubleshooting

### Problem: "Logic Apps endpoint not configured"

**Solution**: Make sure `appsettings.json` has the `LogicApps:FeedbackEndpoint` configured.

### Problem: "403 Forbidden" when calling Logic Apps

**Solution**: Check that the URL includes the full query string with the SAS token (`sig` parameter).

### Problem: Email not received

**Solution**: 
1. Check Logic App run history in Azure Portal
2. Verify Office 365 connection is authenticated
3. Check spam/junk folder

### Problem: "Service unavailable" error

**Solution**: 
1. Verify Logic App is enabled (not disabled)
2. Check Azure service health
3. Review backend logs for actual error

## Files Created/Modified

### Frontend
- `src/types/feedback.ts` - TypeScript interfaces
- `src/services/FeedbackService.ts` - API client
- `src/taskpane/components/Feedback.tsx` - React component
- `src/taskpane/components/TabArea.tsx` - Added feedback tab
- `src/i18n/locales/en-us.ts` - Translations

### Backend
- `Models/FeedbackRequest.cs` - Request model
- `Models/FeedbackResponse.cs` - Response model
- `Models/LogicAppFeedbackPayload.cs` - Logic Apps payload
- `Controllers/FeedbackController.cs` - API endpoint
- `Program.cs` - Added HttpClient service
- `appsettings.json` - Added Logic Apps configuration

## Next Steps

1. **Multi-language Support**: Add translations for other languages in i18n
2. **Analytics**: Track feedback types and ratings in Application Insights
3. **Auto-reply**: Send a confirmation email to users
4. **Database Storage**: Store feedback in Cosmos DB or SQL Database for analytics
5. **Power BI Dashboard**: Visualize feedback trends and ratings

## Support

If you encounter issues:
1. Check the backend logs (Serilog outputs to console and file)
2. Review Logic App run history in Azure Portal
3. Enable browser dev tools to see network requests
4. Check Application Insights for errors

---

**Created**: October 12, 2025  
**Last Updated**: October 12, 2025  
**Version**: 1.0.0
