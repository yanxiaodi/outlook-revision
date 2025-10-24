# Privacy Policy and Terms of Service

This directory contains the legal documents for OutlookReVision.

## Files

- **`privacy.html`** - Privacy Policy
- **`terms.html`** - Terms of Service

## Access URLs

These files are automatically served by webpack and accessible at:

### Development (Local)
- Privacy Policy: `https://localhost:3000/assets/privacy.html`
- Terms of Service: `https://localhost:3000/assets/terms.html`

### Production
- Privacy Policy: `https://revision.funcoding.nz/assets/privacy.html`
- Terms of Service: `https://revision.funcoding.nz/assets/terms.html`

## Testing Locally

1. Start the dev server:
   ```bash
   npm run dev-server:local
   ```

2. Open in browser:
   - https://localhost:3000/assets/privacy.html
   - https://localhost:3000/assets/terms.html

## Manifest Configuration

The manifest.json file already references these URLs:
```json
"developer": {
  "privacyUrl": "https://revision.funcoding.nz/assets/privacy.html",
  "termsOfUseUrl": "https://revision.funcoding.nz/assets/terms.html"
}
```

## ConsentManager Integration

The `ConsentManager.ts` utility also references these URLs:
```typescript
export const PRIVACY_POLICY_URL = 'https://revision.funcoding.nz/assets/privacy.html';
export const TERMS_OF_SERVICE_URL = 'https://revision.funcoding.nz/assets/terms.html';
```

## Deployment

These files are automatically included in the build process via webpack's `CopyWebpackPlugin`:
- Development: Copied to `dist/assets/`
- Production: Deployed to Azure Static Web Apps at `/assets/` path

## Content Details

### Privacy Policy Includes:
- What data is collected (email content, user info, technical data)
- How data is processed (Azure OpenAI)
- Data retention periods (30 days for logs, no permanent storage)
- User rights (GDPR/CCPA compliance)
- Contact information
- Azure region (Australia East)

### Terms of Service Includes:
- Acceptable use policy
- Service availability and limitations
- Rate limits (50 requests per day)
- AI content disclaimer
- Liability limitations
- Academic research disclosure
- Governing law (New Zealand)

## Legal Compliance

These documents ensure compliance with:
- ✅ GDPR (General Data Protection Regulation)
- ✅ CCPA (California Consumer Privacy Act)
- ✅ PIPEDA (Canada)
- ✅ Privacy Act 2020 (New Zealand)
- ✅ Microsoft AppSource certification requirements

## Customization

Both files are already customized with:
- ✅ Your email: xiaodi.yan@outlook.com
- ✅ Website: https://revision.funcoding.nz
- ✅ Azure region: Australia East
- ✅ Organization: FUNCODING
- ✅ Academic context: COMP693 AUT
- ✅ Last updated: October 19, 2025

No further customization needed unless:
- You change Azure regions
- You add new data collection practices
- You change retention periods
- You update contact information

## Next Steps

See the main implementation guide:
- `docs/PRIVACY_IMPLEMENTATION_CHECKLIST.md` - Step-by-step implementation
- `docs/PRIVACY_AND_CONSENT.md` - Complete legal requirements
- `PRIVACY_COMPLIANCE_SUMMARY.md` - Quick reference guide

---

**Status**: ✅ Ready for development and testing
**Deployment**: Will be automatically deployed with next build
