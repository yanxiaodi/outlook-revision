# HTML Templates for Privacy Policy and Terms of Service

This folder contains ready-to-deploy HTML templates for your legal documents.

## 📁 Files

- **`privacy.html`** - Privacy Policy page
- **`terms.html`** - Terms of Service page

## 🔧 How to Use These Templates

### Step 1: Customize the Content

Both files contain placeholders marked with `[REPLACE: ...]` that you need to update:

#### Required Replacements:

| Placeholder | Example Value | Where to Find |
|-------------|---------------|---------------|
| `[REPLACE WITH ACTUAL DATE, ...]` | October 19, 2025 | Today's date |
| `[REPLACE: Your Organization Name]` | FUNCODING Ltd | Your legal business name |
| `[REPLACE: your-email@example.com]` | privacy@funcoding.nz | Your support/privacy email |
| `[REPLACE: e.g., Australia East]` | Australia East | Your Azure region |
| `[REPLACE: YEAR]` | 2025 | Current year |
| `[REPLACE: Your Country/State]` | New Zealand | Your jurisdiction |
| `[REPLACE: Your Business Address]` | (Optional) Your physical address |

### Step 2: Search and Replace

**Quick method** (VS Code):
1. Open each HTML file
2. Press `Ctrl+H` (Windows) or `Cmd+H` (Mac)
3. Search for `[REPLACE:`
4. Replace each instance with actual values

**Systematic method**:
1. Create a replacement list (see table above)
2. Go through each `[REPLACE:` marker one by one
3. Update with your actual information

### Step 3: Review Legal Content

⚠️ **Important**: These templates are generic and may not cover all legal requirements for your specific situation.

**Before deploying, consider**:
- If you're in the EU, you may need additional GDPR-specific clauses
- If you have enterprise customers, they may require custom DPAs
- Healthcare or financial industries have stricter requirements
- Consult a lawyer if you're unsure

### Step 4: Deploy to Web Server

These files need to be publicly accessible at:
- `https://revision.funcoding.nz/privacy` (privacy.html)
- `https://revision.funcoding.nz/terms` (terms.html)

#### Option A: Azure Static Web Apps (Recommended)
1. Copy files to your Static Web App's root directory
2. Deploy via GitHub Actions (see main DEPLOYMENTS.md)
3. Files will be available at `https://your-site.azurestaticapps.net/privacy.html`

#### Option B: Azure Blob Storage (Static Website)
1. Enable static website hosting on your storage account
2. Upload `privacy.html` and `terms.html` to `$web` container
3. Set index document to `index.html`
4. Access via `https://your-account.z8.web.core.windows.net/privacy.html`

#### Option C: Custom Web Server
1. Upload files to your web server's public directory
2. Ensure files are accessible without authentication
3. Test URLs in an incognito browser window

### Step 5: Update Manifest and Code

After deploying, update these files with your actual URLs:

1. **Manifest** - `src/add-in/OutlookReVision/manifest.json`:
   ```json
   {
     "privacyUrl": "https://revision.funcoding.nz/privacy",
     "termsOfUseUrl": "https://revision.funcoding.nz/terms"
   }
   ```

2. **ConsentManager** - `src/add-in/OutlookReVision/src/utils/ConsentManager.ts`:
   ```typescript
   export const PRIVACY_POLICY_URL = 'https://revision.funcoding.nz/privacy';
   export const TERMS_OF_SERVICE_URL = 'https://revision.funcoding.nz/terms';
   ```

---

## 🎨 Customization Options

### Changing Colors

The templates use Microsoft's brand color (`#0078d4`). To change:

1. Find the `<style>` section in each HTML file
2. Search for `#0078d4` (Microsoft blue)
3. Replace with your brand color (e.g., `#ff6347` for tomato red)

### Adding Your Logo

Add your logo to the top of each page:

```html
<div class="container">
  <!-- Add this line -->
  <img src="https://revision.funcoding.nz/assets/logo.png" alt="Logo" style="max-width: 200px; margin-bottom: 20px;">
  
  <h1>Privacy Policy for OutlookReVision</h1>
  ...
</div>
```

### Adding Navigation

Create a simple header navigation:

```html
<body>
  <!-- Add this before container -->
  <nav style="background: #333; color: white; padding: 10px; text-align: center;">
    <a href="index.html" style="color: white; margin: 0 15px;">Home</a>
    <a href="privacy.html" style="color: white; margin: 0 15px;">Privacy</a>
    <a href="terms.html" style="color: white; margin: 0 15px;">Terms</a>
  </nav>
  
  <div class="container">
    ...
  </div>
</body>
```

---

## 🧪 Testing Your Deployed Pages

### Checklist:

- [ ] Privacy page loads without errors
- [ ] Terms page loads without errors
- [ ] All internal links work (e.g., links between privacy and terms)
- [ ] External links open in new tabs (Microsoft links, etc.)
- [ ] Pages are mobile-responsive (test on phone)
- [ ] No `[REPLACE:` placeholders remain
- [ ] Contact email is correct and active
- [ ] Date is current
- [ ] Pages load in incognito mode (no authentication required)

### Test Commands:

```bash
# Test if URLs are accessible
curl -I https://revision.funcoding.nz/privacy
curl -I https://revision.funcoding.nz/terms

# Should return: HTTP/1.1 200 OK
```

---

## 📱 Mobile Preview

Both templates are mobile-responsive and include:
- Readable font sizes on small screens
- Proper spacing and padding
- No horizontal scrolling
- Touch-friendly links

Test on:
- iPhone Safari
- Android Chrome
- Tablet (iPad, etc.)

---

## 🔒 Security Considerations

### HTTPS Required
Privacy and terms pages **must** be served over HTTPS:
- ✅ `https://revision.funcoding.nz/privacy`
- ❌ `http://revision.funcoding.nz/privacy` (insecure!)

### No Authentication
These pages must be publicly accessible without login:
- Users need to read them **before** creating an account
- Microsoft AppSource reviewers need to access them
- Privacy regulators may request to review them

### Content Security Policy
If using CSP headers, ensure external links (Microsoft, etc.) are allowed:
```
Content-Security-Policy: default-src 'self'; style-src 'unsafe-inline'; img-src 'self' https:; frame-ancestors 'none';
```

---

## 📋 Maintenance Checklist

### When to Update:

1. **Privacy Policy Changes** - Whenever you:
   - Change data collection practices
   - Add new third-party services
   - Change data retention periods
   - Update contact information

2. **Terms of Service Changes** - Whenever you:
   - Change pricing or service tiers
   - Add/remove features
   - Update acceptable use policies
   - Change liability limitations

### Update Process:

1. Update the HTML file(s)
2. Change "Last Updated" date
3. Increment `CONSENT_VERSION` in `ConsentManager.ts`
4. Re-deploy to production
5. Users will be prompted to re-consent on next add-in load

---

## 🆘 Common Issues

### Issue: 404 Not Found
**Cause**: File not deployed or incorrect URL  
**Fix**: Verify file is in web server's public directory

### Issue: Links Don't Work
**Cause**: Relative paths incorrect  
**Fix**: Use absolute URLs for cross-page links

### Issue: Styling Broken
**Cause**: Missing `<style>` section  
**Fix**: Ensure entire `<head>` section is copied

### Issue: Mobile Formatting Bad
**Cause**: Missing viewport meta tag  
**Fix**: Keep this line in `<head>`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 📞 Support

For help with these templates:
1. Check the main [Privacy & Consent Guide](../PRIVACY_AND_CONSENT.md)
2. Review the [Implementation Checklist](../PRIVACY_IMPLEMENTATION_CHECKLIST.md)
3. Create a GitHub issue if you find errors

---

## ⚖️ Legal Disclaimer

These templates are provided as-is for educational purposes. They are **not** legal advice and may not cover all legal requirements for your specific situation. 

**Always consult a qualified attorney** before deploying legal documents that govern your service.

---

**Last Updated**: October 19, 2025
