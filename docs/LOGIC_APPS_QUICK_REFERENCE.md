# Azure Logic Apps - Quick Reference

## JSON Schema for HTTP Trigger

Use this schema in your Logic Apps HTTP trigger to properly parse incoming feedback:

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "feedbackType": {
      "type": "string"
    },
    "rating": {
      "type": "integer"
    },
    "timestamp": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "userAgent": {
      "type": "string"
    },
    "outlookVersion": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    }
  }
}
```

## Email Subject (Dynamic Expression)

```
[@{triggerBody()?['feedbackType']}] ReVision Feedback from @{triggerBody()?['firstName']} @{triggerBody()?['lastName']}
```

**Example Output**: `[Feature Request] ReVision Feedback from John Smith`

## Email Body (HTML with Dynamic Content)

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
  <li><strong>User Agent:</strong> @{triggerBody()?['userAgent']}</li>
</ul>

<hr>
<p><em>This feedback was submitted via the ReVision Outlook Add-in feedback form.</em></p>
```

## Response Body (JSON)

```json
{
  "success": true,
  "message": "Feedback received successfully"
}
```

## Example Payload

This is what the backend sends to Logic Apps:

```json
{
  "email": "john.smith@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "message": "The translation feature works great! I'd love to see support for more languages like Arabic and Hebrew.",
  "feedbackType": "Feature Request",
  "rating": 5,
  "timestamp": "2025-10-12T14:30:15.123Z",
  "version": "1.0.0",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "outlookVersion": "16.0.14326.20404",
  "platform": "Windows"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email for follow-up |
| `firstName` | string | Yes | User's first name |
| `lastName` | string | Yes | User's last name |
| `message` | string | Yes | Feedback message content |
| `feedbackType` | string | Yes | "Bug Report", "Feature Request", "General Feedback", or "Other" |
| `rating` | integer | No | User rating from 1-5 stars (null if not provided) |
| `timestamp` | string | Yes | ISO 8601 format, server-generated |
| `version` | string | No | Add-in version (e.g., "1.0.0") |
| `userAgent` | string | No | Browser user agent string |
| `outlookVersion` | string | No | Outlook host version |
| `platform` | string | No | "Windows", "Mac", "Web", or "Mobile" |

## Quick Setup Steps

1. **Create Logic App** in Azure Portal
2. **Add HTTP Trigger**
   - Paste the JSON schema above
3. **Add Send Email (V2)**
   - To: Your email
   - Subject: Use the dynamic expression above
   - Body: Paste the HTML above, switch to Code View first
4. **Add Response**
   - Status: 200
   - Body: Paste the response JSON above
5. **Save** and copy the HTTP POST URL
6. **Update** `appsettings.json` with the URL

## Testing with Postman/cURL

```bash
curl -X POST "YOUR_LOGIC_APPS_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "message": "This is a test feedback",
    "feedbackType": "General Feedback",
    "rating": 4,
    "timestamp": "2025-10-12T14:30:00Z",
    "version": "1.0.0",
    "platform": "Windows"
  }'
```

## Monitoring

View Logic App runs:
1. Go to Azure Portal
2. Open your Logic App
3. Click **Overview** → **Runs history**
4. Click on any run to see details
5. Expand each step to see inputs/outputs

---

For detailed setup instructions, see [FEEDBACK_SETUP.md](./FEEDBACK_SETUP.md)
