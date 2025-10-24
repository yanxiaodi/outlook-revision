# User Secrets Configuration Guide

This document explains how user secrets are configured for the ReVision Web API.

## ✅ Current Configuration

The following user secrets have been configured for local development:

### Logic Apps Configuration
- **Key**: `LogicApps:FeedbackEndpoint`
- **Value**: Azure Logic Apps HTTP trigger URL
- **Purpose**: Securely store the feedback email endpoint
- **Status**: ✅ Configured

### Azure OpenAI Configuration
- **Key**: `AzureOpenAIOptions:Model`
- **Value**: GPT model name
- **Key**: `AzureOpenAIOptions:Endpoint`
- **Value**: Azure OpenAI endpoint URL
- **Key**: `AzureOpenAIOptions:ApiKey`
- **Value**: Azure OpenAI API key

### Application Insights
- **Key**: `ApplicationInsights:ConnectionString`
- **Value**: Application Insights connection string

## 📋 Managing User Secrets

### View All Secrets
```powershell
cd src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi
dotnet user-secrets list
```

### Set a Secret
```powershell
dotnet user-secrets set "KeyName" "Value"
```

### Remove a Secret
```powershell
dotnet user-secrets remove "KeyName"
```

### Clear All Secrets
```powershell
dotnet user-secrets clear
```

## 🔐 Security Notes

### Local Development
- ✅ User secrets are stored in your user profile folder
- ✅ NOT in the project directory
- ✅ NOT committed to source control
- ✅ Windows location: `%APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json`

### Production Deployment
For production, use one of these secure options:

#### Option 1: Azure App Configuration (Recommended)
```json
{
  "LogicApps:FeedbackEndpoint": "https://yourapp.azconfig.io"
}
```

#### Option 2: Azure Key Vault
```json
{
  "LogicApps:FeedbackEndpoint": "@Microsoft.KeyVault(SecretUri=https://your-keyvault.vault.azure.net/secrets/LogicAppsFeedbackUrl/)"
}
```

#### Option 3: Environment Variables
```powershell
# Set environment variable
$env:LogicApps__FeedbackEndpoint = "YOUR_URL"
```

#### Option 4: Azure App Service Configuration
In Azure Portal → App Service → Configuration → Application Settings:
- **Name**: `LogicApps:FeedbackEndpoint`
- **Value**: Your Logic Apps URL

## 🚀 How It Works

The configuration hierarchy in ASP.NET Core:
1. `appsettings.json` (base configuration)
2. `appsettings.{Environment}.json` (environment-specific)
3. **User Secrets** (local development only)
4. Environment Variables (override everything)
5. Azure Key Vault (production)

User secrets override `appsettings.json` but are overridden by environment variables.

## ✅ Verification

To verify the Logic Apps endpoint is configured correctly:

1. Run the API:
   ```powershell
   cd src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi
   dotnet run
   ```

2. Check the logs for:
   ```
   ReVision Web API started successfully. Ready to accept requests.
   ```

3. Test the feedback endpoint (after frontend is running):
   - Open the add-in
   - Navigate to Feedback tab
   - Submit test feedback
   - Check for success message

## 📝 Updating the Logic Apps URL

If you need to update the Logic Apps URL (e.g., after recreating the Logic App):

```powershell
cd src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi
dotnet user-secrets set "LogicApps:FeedbackEndpoint" "NEW_URL_HERE"
```

## 🔍 Troubleshooting

### "Logic Apps endpoint is not configured"
**Solution**: Verify the secret is set:
```powershell
dotnet user-secrets list | Select-String "LogicApps"
```

### Secret not being read
**Solution**: Check the UserSecretsId in `.csproj`:
```xml
<PropertyGroup>
  <UserSecretsId>your-guid-here</UserSecretsId>
</PropertyGroup>
```

### Need to reset secrets
**Solution**: Clear and re-add:
```powershell
dotnet user-secrets clear
dotnet user-secrets set "LogicApps:FeedbackEndpoint" "YOUR_URL"
```

## 📚 Related Documentation

- [FEEDBACK_SETUP.md](./FEEDBACK_SETUP.md) - Logic Apps setup guide
- [FEEDBACK_IMPLEMENTATION.md](./FEEDBACK_IMPLEMENTATION.md) - Implementation details
- [Microsoft Docs: Safe storage of app secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Configured and ready to use
