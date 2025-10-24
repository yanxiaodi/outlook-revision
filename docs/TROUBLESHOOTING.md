# Troubleshooting Guide

This guide covers common issues you may encounter when developing or deploying the OutlookReVision add-in.

## Table of Contents

- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Manifest Issues](#manifest-issues)
- [Sideloading Issues](#sideloading-issues)
- [Deployment Issues](#deployment-issues)

---

## Backend Issues

### Problem: Backend fails to start

**Solution**: Ensure user secrets are configured correctly

```bash
cd src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi
dotnet user-secrets list
```

Verify that all required secrets are set:
- `AzureOpenAIOptions:Model`
- `AzureOpenAIOptions:Endpoint`
- `AzureOpenAIOptions:ApiKey`
- `ApplicationInsights:ConnectionString`

### Problem: CORS errors

**Solution**: The backend allows all origins by default. Check browser console for specific errors. If you need to restrict CORS, modify the CORS policy in `Program.cs`.

---

## Frontend Issues

### Problem: SSL certificate errors in development

**Solution**: Trust the Office dev certificates:

```bash
cd src/add-in/OutlookReVision
npx office-addin-dev-certs install
```

You may need to:
1. Delete old certificates (click Yes when prompted)
2. Install new certificates (click Yes when prompted)
3. Restart your terminal and dev server

### Problem: Add-in doesn't load

**Solution**: 

1. Clear Office cache: 
   - Windows: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
   - Delete all files in this folder
2. Restart Outlook completely (check Task Manager to ensure it's closed)
3. Ensure your dev server is running at `https://localhost:3000`
4. Try `npm run stop` then `npm start` again

### Problem: Can't connect to backend API

**Solution**: 

1. Check the API URL in browser console (should see "REACT_APP_API_HOST configured: ..." log)
2. Verify backend is running (if using local backend at `http://localhost:5298`)
3. Check CORS settings in the backend
4. **If using `dev-server:azure` but seeing proxy errors to localhost:5298**: Stop the dev server and restart it. The environment variable must be set when webpack-dev-server starts to disable the proxy correctly.

### Problem: Proxy errors when using Azure backend (`npm run dev-server:azure`)

**Symptoms**: Error like `[HPM] Error occurred while proxying request localhost:3000/api/Outlook/... to http://localhost:5298/`

**Solution**: This happens when webpack-dev-server's proxy is still active even though you're trying to use Azure backend. Restart the dev server:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev-server:azure
```

The webpack proxy is automatically disabled when `REACT_APP_API_HOST` is set, but you need to restart the dev server for this to take effect.

### Problem: Using `dev-server:azure` but API calls still go to `https://localhost:3000/api/...`

**Symptoms**: Console shows `[ReVisionService] API Host:` is empty, URLs like `POST https://localhost:3000/api/Outlook/translate`

**Solution**: Outlook is using cached add-in files. Clear the cache:

1. Close Outlook completely
2. Delete the cache folder: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\` (Windows)
3. Restart the dev server: `npm run dev-server:azure`
4. Restart Outlook and reload the add-in
5. Verify in console: `REACT_APP_API_HOST` should show the Azure URL

### Problem: Node version compatibility errors

**Symptoms**: `EBADENGINE` warnings about Node version requirements

**Solution**: 

1. Upgrade to Node.js 20 or later:
   - Download from https://nodejs.org/
   - Or use nvm: `nvm install 20 && nvm use 20`
2. Verify version: `node --version` (should show v20.x.x or higher)
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and `package-lock.json`
5. Reinstall: `npm install`

---

## Manifest Issues

### Problem: Outlook rejects the manifest

**Solution**: Validate the manifest:

```bash
cd src/add-in/OutlookReVision
npm run validate
```

Common manifest issues:
- Invalid URLs (must be HTTPS in production)
- Missing required icons
- Invalid version format
- Incorrect domain permissions

### Problem: Cannot manually sideload JSON manifest

**Explanation**: JSON manifests (Unified manifest for Microsoft 365) cannot be sideloaded using "Add from File" in Outlook's UI. They must be sideloaded via command-line tools.

**Solution**: Use `npm start` instead of manual sideloading. See the [Sideloading Issues](#sideloading-issues) section below.

---

## Sideloading Issues

### Problem: `npm start` fails or Outlook doesn't open

**Solution**: 

1. Make sure Outlook is completely closed (check Task Manager for any running Outlook processes)
2. Clear the Office cache: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
3. Try running `npm run stop` first to clean up any previous registration
4. Run `npm start` again
5. If still failing, check the terminal output for specific error messages

### Problem: Certificate errors or security warnings

**Solution**: 

1. Run `npx office-addin-dev-certs install` to trust the development certificates
2. Accept all prompts to delete old certificates and install new ones
3. Restart your terminal
4. Run `npm start` again

### Problem: Add-in doesn't appear in Outlook ribbon

**Solution**:

1. Check that the dev server is running (you should see webpack output in the terminal)
2. In Outlook, compose a new email and look for the **ReVision** button on the **Home** ribbon
3. Clear Office cache and restart Outlook
4. Try `npm run stop` then `npm start` again
5. Check if the add-in is registered:
   - Windows: Look in `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
   - You should see files related to your add-in

### Problem: Add-in shows "There was a problem" error

**Solution**:

1. Check browser console (F12) for specific error messages
2. Verify the dev server is running and accessible at `https://localhost:3000`
3. Check if certificate is trusted
4. Clear Office cache and restart
5. Check if the manifest URLs are correct

### Problem: Changes not reflecting in Outlook

**Solution**: Outlook aggressively caches add-in files.

1. Close Outlook completely
2. Clear the cache: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
3. Stop the dev server (Ctrl+C)
4. Run `npm run stop` to unregister
5. Run `npm start` to rebuild and re-register
6. Outlook will open with fresh files

---

## Deployment Issues

### Backend Deployment Issues

#### Problem: Backend workflow fails with "Specify a project or solution file"

**Symptoms**: Error message "MSBUILD : error MSB1003: Specify a project or solution file. The current working directory does not contain a project or solution file."

**Solution**:

The `dotnet build` and `dotnet publish` commands must run from the project directory. Ensure the workflow has `working-directory` specified:

```yaml
- name: Build with dotnet
  run: dotnet build --configuration Release
  working-directory: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
```

#### Problem: Backend deployment fails with publish profile authentication error

**Symptoms**: Error during "Deploy to Azure Web App" step about invalid credentials

**Solution**:

1. Go to Azure Portal → Your App Service
2. Click "Get publish profile" and download the file
3. Update GitHub repository secret:
   - Settings → Secrets and variables → Actions
   - Edit `AZURE_WEBAPP_PUBLISH_PROFILE` with new publish profile contents
4. Re-run the workflow

#### Problem: Backend deployed but application settings missing

**Symptoms**: App deploys successfully but returns errors about missing configuration

**Solution**:

GitHub Actions only deploys the code, not configuration. Configure application settings manually in Azure Portal:

1. Navigate to your App Service
2. Go to "Configuration" → "Application settings"
3. Add required settings (use `__` instead of `:` for nested values):
   - `AzureOpenAIOptions__Model`
   - `AzureOpenAIOptions__Endpoint`
   - `AzureOpenAIOptions__ApiKey`
   - `ApplicationInsights__ConnectionString`
4. Click "Save" and restart the app

### Frontend Deployment Issues

#### Problem: GitHub Actions workflow fails at "Setup Node.js" step

**Symptoms**: Error about cache not found or paths not resolved

**Solution**: 

1. Verify `package-lock.json` exists in `src/add-in/OutlookReVision/`
2. If missing, run `npm install` locally and commit `package-lock.json`
3. Ensure `cache-dependency-path` in workflow points to the correct location

#### Problem: GitHub Actions workflow fails with Node version errors

**Symptoms**: `EBADENGINE` warnings or errors about unsupported Node version

**Solution**: 

1. Ensure the workflow uses Node 20.x (check `.github/workflows/azure-staticwebapp.yml`)
2. Verify `package.json` has correct engines specification:
   ```json
   "engines": {
     "node": ">=20.0.0",
     "npm": ">=10.0.0"
   }
   ```

#### Problem: Azure Static Web Apps deploy fails with "Failed to find default file"

**Symptoms**: Error message "Failed to find a default file in the app artifacts folder"

**Solution**: 

1. Verify `index.html` is generated during build:
   - Check `src/add-in/OutlookReVision/src/index.html` exists
   - Check `webpack.config.js` includes `HtmlWebpackPlugin` for `index.html`
2. Verify workflow configuration:
   - `app_location` should be `src/add-in/OutlookReVision`
   - `app_artifact_location` should be `dist`
   - `skip_app_build` should be `false` or omitted

#### Problem: Deployed add-in doesn't load from Azure Static Web App

**Solution**:

1. Check the Static Web App URL is correct in browser
2. Verify deployment succeeded in Azure Portal (Deployments section)
3. Check browser console for CORS or CSP errors
4. Ensure manifest.json points to the correct production URLs
5. Clear browser cache and try again

#### Problem: GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN` is invalid

**Solution**:

1. Go to Azure Portal → Your Static Web App
2. Navigate to "Deployment" → "Deployment token"
3. Copy the new token
4. Update GitHub repository secret:
   - Settings → Secrets and variables → Actions
   - Edit `AZURE_STATIC_WEB_APPS_API_TOKEN` with new token
5. Re-run the workflow

### General Deployment Issues

#### Problem: Both workflows triggered but only one completes

**Symptoms**: Pushing to main triggers both backend and frontend workflows, but one fails or hangs

**Solution**:

This is normal - both workflows run independently in parallel. Check each workflow individually:

1. Go to "Actions" tab
2. Check each workflow run separately
3. Fix issues in the failing workflow
4. Re-run failed jobs if needed

#### Problem: Workflow runs but nothing changes in production

**Symptoms**: GitHub Actions shows success but deployed app hasn't updated

**Solution**:

1. **Clear browser cache**: Hard refresh (Ctrl+F5) or clear cache
2. **Check deployment timestamp**: In Azure Portal, verify the deployment time matches your commit
3. **Check logs**: Review deployment logs in Azure Portal for any silent failures
4. **Restart the app**: In Azure Portal, restart the App Service or Static Web App

---

## Additional Help

If you're still experiencing issues:

1. Check the [Office Add-ins Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)
2. Review [Outlook Add-ins Troubleshooting Guide](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/troubleshoot-development-errors)
3. Search the [GitHub Issues](https://github.com/OfficeDev/office-js/issues) for similar problems
4. Create a new issue in the repository with:
   - Clear description of the problem
   - Steps to reproduce
   - Error messages from console/terminal
   - Environment details (OS, Node version, Office version)
