# Production Deployment Guide

This guide covers deploying the OutlookReVision add-in to production environments.

## Table of Contents

- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
  - [How the Workflow Works](#how-the-workflow-works)
  - [Setup Instructions](#setup-instructions)
  - [Default Document](#default-document-indexhtml)
  - [Monitoring Deployments](#monitoring-deployments)
- [Publishing to Microsoft AppSource](#publishing-to-microsoft-appsource)
- [Updating Deployments](#updating-deployments)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring Production](#monitoring-production)

---

## Backend Deployment

The backend is deployed automatically to Azure App Service via GitHub Actions.

### Current Production Backend

```
https://outlook-revision-api-d0dqe4a6ggencehj.australiaeast-01.azurewebsites.net
```

### How the Workflow Works

**Workflow File**: `.github/workflows/azure-webapps-dotnet-core.yml`

**Trigger**: The workflow runs automatically on:
- Push to the `main` branch
- Manual trigger via "Run workflow" button in GitHub Actions

**Build Process**:

1. **Checkout**: Pulls the latest code from the repository
2. **Setup .NET Core**: Installs .NET 9.0 SDK
3. **Cache NuGet packages**: Caches dependencies for faster builds
4. **Build**: Runs `dotnet build --configuration Release` in the project directory
5. **Publish**: Runs `dotnet publish -c Release` to create deployment package
6. **Upload artifact**: Packages the published app for deployment
7. **Deploy to Azure**: Deploys to Azure App Service using publish profile

**Key Configuration**:

- **.NET Version**: Uses .NET 9.0
- **Project Path**: `src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi`
- **Build Configuration**: Release
- **Working Directory**: Commands run from the project folder (where `.csproj` is located)

### Initial Setup

#### 1. Create Azure App Service

Using Azure Portal:

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Web App**
3. Configure:
   - **Resource group**: `rg-revision`
   - **Name**: `outlook-revision-api` (or your preferred name)
   - **Runtime stack**: .NET 9
   - **Operating System**: Linux or Windows
   - **Region**: Your preferred region
   - **Pricing plan**: Choose appropriate tier

Using Azure CLI:

```bash
az webapp create \
  --resource-group rg-revision \
  --plan <app-service-plan-name> \
  --name outlook-revision-api \
  --runtime "DOTNET:9.0"
```

#### 2. Get Publish Profile

**Via Azure Portal**:

1. Navigate to your App Service
2. Click **Get publish profile** in the Overview page
3. Download the `.PublishSettings` file
4. Open the file and copy its entire contents

**Via Azure CLI**:

```bash
az webapp deployment list-publishing-profiles \
  --name outlook-revision-api \
  --resource-group rg-revision \
  --xml
```

#### 3. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Paste the publish profile XML contents
5. Click "Add secret"

#### 4. Configure Application Settings

In Azure Portal, configure the following application settings (Configuration → Application settings):

```
AzureOpenAIOptions__Model=<your-model-name>
AzureOpenAIOptions__Endpoint=https://<your-endpoint>.openai.azure.com/
AzureOpenAIOptions__ApiKey=<your-api-key>
ApplicationInsights__ConnectionString=<your-connection-string>
```

**Note**: Use double underscores (`__`) in Azure App Settings to represent nested configuration (`:` in appsettings.json).

#### 5. Deploy

**Option A - Automatic (Push to main)**:

After pushing changes to the `main` branch, the workflow will trigger automatically.

**Option B - Manual Trigger**:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Build and deploy ASP.Net Core app to an Azure Web App" workflow
4. Click "Run workflow" → Select branch → "Run workflow"

### Monitoring Backend Deployments

#### GitHub Actions

1. Go to repository's "Actions" tab
2. Click on the latest "Build and deploy ASP.Net Core app" run
3. View logs for:
   - .NET setup
   - Build step
   - Publish step
   - Deployment to Azure

#### Azure Portal

1. Navigate to your App Service
2. Check:
   - **Deployment Center**: View deployment history and logs
   - **Log stream**: Real-time application logs
   - **Application Insights**: Performance metrics and traces

#### Verify Deployment

Test the API endpoints:

```bash
# Health check (if configured)
curl https://outlook-revision-api-d0dqe4a6ggencehj.australiaeast-01.azurewebsites.net/health

# Test an API endpoint
curl https://outlook-revision-api-d0dqe4a6ggencehj.australiaeast-01.azurewebsites.net/api/Outlook/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","targetLanguage":"es"}'
```

## Frontend Deployment

The frontend is deployed automatically to Azure Static Web Apps using GitHub Actions.

### How the Workflow Works

**Workflow File**: `.github/workflows/azure-staticwebapp.yml`

**Trigger**: The workflow runs automatically on:
- Push to the `main` branch
- Manual trigger via "Run workflow" button in GitHub Actions

**Build Process**:

1. **Checkout**: Pulls the latest code from the repository
2. **Setup Node.js**: Installs Node.js 20.x with npm caching for faster builds
3. **Install Dependencies**: Runs `npm ci` in `src/add-in/OutlookReVision/`
4. **Build Frontend**: Runs `npm run build` to create production-ready files in the `dist/` folder
5. **Deploy to Azure**: Uploads the built artifacts from `dist/` to Azure Static Web Apps

**Key Configuration**:

- **Node Version**: Uses Node 20.x (required by Azure SDK packages)
- **App Location**: `src/add-in/OutlookReVision` (source folder)
- **Artifact Location**: `dist` (build output folder)
- **API Location**: Empty (no backend API bundled with static site)
- **Skip App Build**: `false` (lets Oryx detect the pre-built artifacts)

**Engine Requirements**: The `package.json` specifies:

```json
"engines": {
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

This ensures both GitHub Actions and any local builds use compatible Node versions.

### Setup Instructions

#### 1. Create Azure Static Web App

Using Azure Portal:

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → Search for "Static Web App"
3. Configure:
   - **Resource group**: `rg-revision` (or create new)
   - **Name**: `outlook-revision-add-in`
   - **Plan type**: Free or Standard
   - **Region**: Your preferred region (e.g., East US, West Europe)
   - **Deployment details**: Select "Other" (we'll use GitHub Actions)
4. Click "Review + create" → "Create"

Using Azure CLI:

```bash
az staticwebapp create \
  --name outlook-revision-add-in \
  --resource-group rg-revision \
  --location "East US" \
  --sku Free
```

#### 2. Get Deployment Token

**Via Azure Portal**:

1. Navigate to your Static Web App resource
2. Go to "Settings" → "Deployment" → "Deployment token"
3. Click "Manage deployment token" → Copy the token

**Via Azure CLI**:

```bash
az staticwebapp secrets list \
  --name outlook-revision-add-in \
  --resource-group rg-revision \
  --query "properties.apiKey" -o tsv
```

#### 3. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add secret:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: Paste the deployment token from step 2
5. Click "Add secret"

#### 4. Deploy

**Option A - Automatic (Push to main)**:

After pushing changes to the `main` branch, the workflow will trigger automatically.

**Option B - Manual Trigger**:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy web app to Azure Static Web Apps" workflow
4. Click "Run workflow" → Select branch → "Run workflow"

### Default Document (`index.html`)

Azure Static Web Apps requires an `index.html` file at the root of the deployed artifacts.

**How it works in this project**:

1. **Webpack generates `index.html`**: The `webpack.config.js` includes an `HtmlWebpackPlugin` configuration that creates `index.html` in the `dist/` folder.

2. **Template location**: `src/add-in/OutlookReVision/src/index.html`

3. **Purpose**: The `index.html` file serves as a redirect page:
   ```html
   <meta http-equiv="refresh" content="0; url=taskpane.html" />
   <script>window.location.replace("taskpane.html");</script>
   ```

4. **Why needed**: While the actual Outlook add-in entry point is `taskpane.html`, Azure Static Web Apps requires a default document for the root URL.

If you navigate to the root URL of your Static Web App (e.g., `https://outlook-revision-add-in.azurestaticapps.net/`), you'll be automatically redirected to `taskpane.html`.

### Monitoring Deployments

#### GitHub Actions

1. Go to your repository's "Actions" tab
2. Click on the latest workflow run
3. View detailed logs for each step:
   - Setup Node.js
   - Install dependencies
   - Build frontend
   - Deploy to Azure

**Common issues to watch for**:
- Node version mismatches
- Missing `package-lock.json`
- Build failures
- Deployment token errors

#### Azure Portal

1. Navigate to your Static Web App in Azure Portal
2. Go to "Deployment" section
3. View:
   - **Deployment history**: List of all deployments with status
   - **Deployment details**: Build logs, deployment time, commit info
   - **Deployment environments**: Production and PR preview environments

#### Static Web App URL

Your deployed app is accessible at:

```
https://<your-static-web-app-name>.azurestaticapps.net
```

For this project:
```
https://outlook-revision-add-in.azurestaticapps.net
```

**Testing the deployment**:

1. Open the URL in a browser
2. You should see the add-in taskpane (or be redirected from `index.html`)
3. Check browser console (F12) for any errors
4. Verify API calls are going to the correct backend

#### Troubleshooting Deployments

See the [Troubleshooting Guide](TROUBLESHOOTING.md#deployment-issues) for common deployment problems and solutions.

## Publishing to Microsoft AppSource

To make your add-in available to all Microsoft 365 users via the official marketplace:

### Prerequisites

1. **Production hosting**: Add-in must be hosted on a secure, publicly accessible server (Azure Static Web App ✓)
2. **HTTPS required**: All URLs must use HTTPS (Azure Static Web Apps provides this automatically)
3. **Privacy policy**: Required document for all AppSource apps
4. **Support information**: Contact details for user support
5. **Partner Center account**: Microsoft account with Partner Center access

### Step-by-Step Process

#### 1. Update Manifest for Production

Edit `manifest.json` to point to your production Azure Static Web App:

```json
{
  "authorization": {
    "permissions": {
      "resourceSpecific": [
        {
          "name": "Mailbox.ReadWrite.User",
          "type": "Delegated"
        }
      ]
    }
  },
  "extensions": [
    {
      "requirements": {
        "capabilities": [
          {
            "name": "Mailbox",
            "minVersion": "1.1"
          }
        ]
      },
      "runtimes": [
        {
          "requirements": {
            "capabilities": [
              {
                "name": "Mailbox",
                "minVersion": "1.3"
              }
            ]
          },
          "id": "TaskPaneRuntime",
          "type": "general",
          "code": {
            "page": "https://outlook-revision-add-in.azurestaticapps.net/taskpane.html"
          }
        }
      ]
    }
  ]
}
```

#### 2. Create Partner Center Account

1. Go to [Microsoft Partner Center](https://partner.microsoft.com/)
2. Sign in with Microsoft account (or create one)
3. Enroll in the Microsoft Partner Network (if not already enrolled)
4. Complete identity verification process

#### 3. Create AppSource Listing

1. Navigate to Partner Center Dashboard
2. Go to **Marketplace offers** → **Office Add-in**
3. Click **+ New offer** → **Office Add-in**
4. Fill in required information:
   - **Offer ID**: Unique identifier (e.g., `outlook-revision-addin`)
   - **Offer alias**: Internal name for your reference

#### 4. Configure Offer Setup

**Offer setup page**:
- Connect to CRM system (optional)
- Enable test drive (optional)
- Set up lead management (optional)

#### 5. Add Offer Properties

- **Category**: Productivity, Communication
- **Industries**: Cross-industry or specific industries
- **Legal information**: Terms of use, privacy policy URLs

#### 6. Create Offer Listing

Provide marketplace listing details:

**Basic information**:
- **Name**: OutlookReVision - Email Composition Assistant
- **Search results summary**: Brief description (max 100 characters)
- **Short description**: Concise overview (max 200 characters)
- **Description**: Full description with features and benefits (supports HTML)

**Multimedia**:
- **Logo**: 216x216px PNG with transparent background
- **Screenshots**: At least 1, max 5 (1366x768px or 1024x768px)
- **Videos**: Demo videos (optional but recommended)

**Supporting documents**:
- User guide (PDF)
- Quick start guide (PDF)

**Contact information**:
- Support contact: Email address for user support
- Engineering contact: Email for technical issues
- Privacy policy URL: Link to privacy policy
- Support URL: Link to support documentation

#### 7. Upload Package

Create the app package:

1. Create folder structure:
   ```
   appPackage/
     ├── manifest.json          (production version)
     └── assets/
         ├── icon-16.png
         ├── icon-32.png
         ├── icon-64.png
         ├── icon-80.png
         └── icon-128.png
   ```

2. Zip the contents (not the folder itself) → `appPackage.zip`

3. Upload to Partner Center:
   - Go to **Packages** section
   - Click **+ Add package**
   - Upload `appPackage.zip`
   - Package will be validated automatically

#### 8. Review and Publish

1. Complete all required sections (indicated by red exclamation marks)
2. Click **Review and publish**
3. Review all information
4. Click **Publish**

#### 9. Microsoft Review Process

**Timeline**: 2-6 weeks typically

**Review stages**:
1. **Automated validation**: Checks manifest format, required fields
2. **Security review**: Scans for security vulnerabilities
3. **Functional testing**: Microsoft testers install and test the add-in
4. **Policy compliance**: Ensures compliance with AppSource policies

**Possible outcomes**:
- **Approved**: Add-in goes live on AppSource
- **Changes requested**: Issues to fix before approval
- **Rejected**: Significant issues requiring redesign

#### 10. Post-Approval

Once approved:

1. **Live on AppSource**: Users can install from Office Store
2. **Update process**: Future updates require re-submission
3. **Analytics**: View usage statistics in Partner Center
4. **User feedback**: Monitor reviews and ratings

### AppSource Requirements Checklist

Before submitting, ensure your add-in meets these requirements:

- [ ] Hosted on HTTPS (Azure Static Web App ✓)
- [ ] All manifest URLs point to production hosting
- [ ] Privacy policy URL is valid and accessible
- [ ] Support contact information provided
- [ ] App icons in all required sizes (16, 32, 64, 80, 128px)
- [ ] Screenshots showing key features
- [ ] Clear, accurate description without marketing hype
- [ ] No broken links in manifest or listing
- [ ] Add-in functions as described
- [ ] Handles errors gracefully
- [ ] Responsive design (works on different screen sizes)
- [ ] Complies with Microsoft AppSource policies

### Additional Resources

- [Microsoft Marketplace certification policies](https://learn.microsoft.com/en-us/legal/marketplace/certification-policies)
- [AppSource Submission Checklist](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/checklist)
- [Partner Center Documentation](https://learn.microsoft.com/en-us/partner-center/)
- [Office Dev Program](https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program)
- [Open an Office account in Partner Center](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/open-a-developer-account)
- [Partner Center enrollment page](https://partner.microsoft.com/en-us/dashboard/account/exp/enrollment/welcome?cloudInstance=Global&accountProgram=office&RedirectedBy=AFD)

## Updating Deployments

### Backend Updates

Automatic via GitHub Actions:

```bash
cd src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi
# Make your changes
git add .
git commit -m "Update backend API"
git push origin main
```

The backend workflow will automatically:
1. Build the .NET project
2. Run tests (if configured)
3. Publish the app
4. Deploy to Azure App Service

### Frontend Updates

Automatic via GitHub Actions:

```bash
cd src/add-in/OutlookReVision
# Make your changes
git add .
git commit -m "Update frontend feature"
git push origin main
```

The frontend workflow will automatically:
1. Install dependencies
2. Build the React app
3. Deploy to Azure Static Web Apps

### Deploying Both Together

If you've updated both backend and frontend:

```bash
git add .
git commit -m "Update backend and frontend"
git push origin main
```

Both workflows will run in parallel automatically.

### Manifest Updates

If you update the manifest:

1. **For development**: Just rebuild and restart (`npm start`)
2. **For organization deployment**: Re-upload to Microsoft 365 Admin Center
3. **For AppSource**: Submit updated package to Partner Center for re-review

---

## Rollback Procedures

### Frontend Rollback

Via GitHub:

1. Go to repository → "Actions" tab
2. Find the last successful deployment
3. Click "Re-run jobs" to redeploy that version

Via Azure Portal:

1. Navigate to Static Web App
2. Go to "Deployment history"
3. Select a previous successful deployment
4. Click "Activate" to roll back

### Backend Rollback

**Via GitHub Actions**:

1. Go to repository → "Actions" tab
2. Find the last successful "Build and deploy ASP.Net Core app" run
3. Click "Re-run jobs" to redeploy that version

**Via Azure Portal**:

1. Navigate to App Service
2. Go to "Deployment Center"
3. View deployment history
4. Select a previous successful deployment
5. Click "Redeploy" or use deployment slots to swap

---

## Monitoring Production

### Frontend Monitoring

- **Azure Static Web Apps**: Built-in analytics in Azure Portal
- **Browser Analytics**: Implement Application Insights for browser telemetry
- **GitHub Actions**: Monitor workflow runs for deployment issues

### Backend Monitoring

- **Application Insights**: Real-time monitoring and diagnostics
- **Azure App Service Logs**: Application logs, web server logs
- **Health Checks**: Configure health check endpoints

### Setting Up Alerts

Configure alerts in Azure Monitor for:

- Deployment failures
- High error rates
- Performance degradation
- Resource usage thresholds

---

For deployment troubleshooting, see the [Troubleshooting Guide](TROUBLESHOOTING.md#deployment-issues).
