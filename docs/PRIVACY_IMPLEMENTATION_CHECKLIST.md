# Privacy & Consent Implementation Checklist

## 🎯 Quick Start Guide

This checklist guides you through implementing legally compliant user consent for OutlookReVision.

---

## Phase 1: Critical Legal Documents (2-3 hours)

### ✅ Step 1: Create Privacy Policy
- [ ] Copy template from `docs/PRIVACY_AND_CONSENT.md` → Privacy Policy section
- [ ] Customize placeholders:
  - [ ] `[YOUR ORGANIZATION NAME]` → Your company name
  - [ ] `[YOUR CONTACT EMAIL]` → Support email (e.g., privacy@funcoding.nz)
  - [ ] `[YOUR AZURE REGION]` → Your Azure region (e.g., "Australia East")
  - [ ] `[YOUR BUSINESS ADDRESS]` → Physical address
  - [ ] `[DATE]` → Today's date
- [ ] Host at public URL: `https://revision.funcoding.nz/privacy`
- [ ] Test URL is accessible (not behind auth)

### ✅ Step 2: Create Terms of Service
- [ ] Copy template from `docs/PRIVACY_AND_CONSENT.md` → Terms of Service section
- [ ] Customize placeholders (same as above)
- [ ] Host at public URL: `https://revision.funcoding.nz/terms`
- [ ] Test URL is accessible

### ✅ Step 3: Update Manifest
File: `src/add-in/OutlookReVision/manifest.json`

Add these fields to the root of the JSON:
```json
{
  "privacyUrl": "https://revision.funcoding.nz/privacy",
  "termsOfUseUrl": "https://revision.funcoding.nz/terms"
}
```

**Validation**:
- [ ] Run `npm run validate` to check manifest
- [ ] No errors related to privacy/terms URLs

---

## Phase 2: Frontend Consent UI (3-4 hours)

### ✅ Step 4: Verify Utility Files Created
- [ ] File exists: `src/add-in/OutlookReVision/src/utils/ConsentManager.ts`
- [ ] File exists: `src/add-in/OutlookReVision/src/components/consent/ConsentDialog.tsx`

### ✅ Step 5: Update Privacy/Terms URLs in Code
File: `src/add-in/OutlookReVision/src/utils/ConsentManager.ts`

Replace placeholders:
```typescript
export const PRIVACY_POLICY_URL = 'https://revision.funcoding.nz/privacy'; // ← Update this
export const TERMS_OF_SERVICE_URL = 'https://revision.funcoding.nz/terms'; // ← Update this
```

### ✅ Step 6: Integrate Consent Dialog into Main TaskPane

File: `src/add-in/OutlookReVision/src/taskpane/components/App.tsx` (or your main component)

Add imports:
```typescript
import { ConsentDialog, useConsent } from '../../components/consent/ConsentDialog';
```

Update component:
```typescript
export const App: React.FC = () => {
  const { hasConsent, showDialog, handleAccept, handleDecline } = useConsent();
  
  return (
    <>
      {/* Show consent dialog on first load */}
      <ConsentDialog 
        open={showDialog}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
      
      {/* Only show AI features if user has consented */}
      {hasConsent ? (
        <YourNormalUI />
      ) : (
        <ConsentRequiredMessage />
      )}
    </>
  );
};
```

**Test**:
- [ ] Clear localStorage: Open DevTools → Application → Local Storage → Delete `outlookrevision_user_consent`
- [ ] Reload add-in → Consent dialog should appear
- [ ] Click "Accept" → Dialog closes, main UI shows
- [ ] Reload → Dialog should NOT appear (consent stored)

---

## Phase 3: Backend API Integration (2-3 hours)

### ✅ Step 7: Update ReVision Service to Check Consent

File: `src/add-in/OutlookReVision/src/services/RealReVisionService.ts`

Add import:
```typescript
import { ConsentManager } from '../utils/ConsentManager';
```

Update each API method (translate, revise, compose, reply):

**BEFORE**:
```typescript
async translate(text: string, targetLanguage: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/Outlook/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });
  return response.json();
}
```

**AFTER**:
```typescript
async translate(text: string, targetLanguage: string): Promise<string> {
  // Check consent before API call
  if (!ConsentManager.hasConsent()) {
    throw new Error('User has not consented to data processing. Please accept the privacy policy.');
  }

  const consentHeaders = ConsentManager.getConsentHeaders();
  
  const response = await fetch(`${API_URL}/api/Outlook/translate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...consentHeaders, // Add consent tracking
    },
    body: JSON.stringify({ text, targetLanguage }),
  });
  
  if (!response.ok) {
    throw new Error(`Translation failed: ${response.statusText}`);
  }
  
  return response.json();
}
```

Repeat for:
- [ ] `translate()` method
- [ ] `revise()` method
- [ ] `compose()` method
- [ ] `reply()` method

**Test**:
- [ ] Clear consent → Try to translate → Should see error message
- [ ] Grant consent → Try to translate → Should work normally
- [ ] Check Network tab → Request headers should include `X-User-Consented: true`

---

## Phase 4: Settings Panel (Optional, 2 hours)

### ✅ Step 8: Add Consent Management to Settings

File: `src/add-in/OutlookReVision/src/taskpane/components/SettingsPage.tsx` (or wherever your settings are)

Add section:
```typescript
import { ConsentManager, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../../utils/ConsentManager';

const SettingsPage: React.FC = () => {
  const [consentStatus, setConsentStatus] = useState(ConsentManager.getConsentStatus());
  
  const handleRevokeConsent = () => {
    if (confirm('Revoke consent? AI features will be disabled.')) {
      ConsentManager.revokeConsent();
      setConsentStatus(ConsentManager.getConsentStatus());
      alert('Consent revoked. Please reload.');
    }
  };
  
  return (
    <div>
      <h3>Privacy & Data</h3>
      <div>
        <strong>Consent Status:</strong> {consentStatus.hasConsent ? '✓ Granted' : '✗ Not Granted'}
      </div>
      {consentStatus.grantedAt && (
        <div><strong>Granted:</strong> {new Date(consentStatus.grantedAt).toLocaleString()}</div>
      )}
      <Button onClick={handleRevokeConsent}>Revoke Consent</Button>
      <div>
        <Link href={PRIVACY_POLICY_URL} target="_blank">Privacy Policy</Link>
        {' | '}
        <Link href={TERMS_OF_SERVICE_URL} target="_blank">Terms of Service</Link>
      </div>
    </div>
  );
};
```

**Test**:
- [ ] Open Settings → See consent status
- [ ] Click "Revoke Consent" → Confirm → Settings update
- [ ] Try to use AI feature → Should fail with error
- [ ] Click privacy/terms links → Opens in new tab

---

## Phase 5: Backend Logging (Optional, 1-2 hours)

### ✅ Step 9: Log Consent Headers in API

File: `src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi/Middleware/LoggingMiddleware.cs` (or create new)

Add middleware to log consent headers:
```csharp
public class ConsentLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ConsentLoggingMiddleware> _logger;

    public ConsentLoggingMiddleware(RequestDelegate next, ILogger<ConsentLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check for consent headers
        if (context.Request.Headers.TryGetValue("X-User-Consented", out var consented))
        {
            _logger.LogInformation(
                "API call with consent: Consented={Consented}, Version={Version}, Date={Date}, Path={Path}",
                consented,
                context.Request.Headers["X-Consent-Version"],
                context.Request.Headers["X-Consent-Date"],
                context.Request.Path
            );
        }
        else
        {
            _logger.LogWarning(
                "API call WITHOUT consent header: Path={Path}, IP={IP}",
                context.Request.Path,
                context.Connection.RemoteIpAddress
            );
        }

        await _next(context);
    }
}
```

Register in `Program.cs`:
```csharp
app.UseMiddleware<ConsentLoggingMiddleware>();
```

**Test**:
- [ ] Make API call with consent → Check logs → Should see "API call with consent"
- [ ] Make API call without headers → Check logs → Should see warning

---

## Phase 6: Testing & Validation (2-3 hours)

### ✅ Step 10: Functional Testing

- [ ] **First-time user flow**:
  - [ ] Clear localStorage
  - [ ] Open add-in → Consent dialog appears
  - [ ] Click "Decline" → Main UI shows "Consent required" message
  - [ ] Reload → Consent dialog appears again
  - [ ] Click "Accept" → Main UI shows normally
  - [ ] Try translate feature → Works successfully

- [ ] **Returning user flow**:
  - [ ] Reload add-in → No consent dialog (already accepted)
  - [ ] All AI features work normally

- [ ] **Consent revocation flow**:
  - [ ] Go to Settings → Click "Revoke Consent"
  - [ ] Try to use AI feature → Shows error message
  - [ ] Reload → Consent dialog appears

- [ ] **Version upgrade flow**:
  - [ ] Manually change consent version in `ConsentManager.ts` (e.g., `1.0` → `2.0`)
  - [ ] Reload → Should prompt for re-consent (new privacy policy)

### ✅ Step 11: Browser Compatibility Testing

- [ ] **Chrome/Edge**: All features work
- [ ] **Firefox**: All features work
- [ ] **Safari** (if applicable): All features work

### ✅ Step 12: Link Validation

- [ ] Privacy Policy URL loads correctly (no 404)
- [ ] Terms of Service URL loads correctly
- [ ] Both documents are publicly accessible (not behind login)
- [ ] Links in consent dialog work
- [ ] Links in settings panel work

---

## Phase 7: Production Deployment (1-2 hours)

### ✅ Step 13: Pre-Deployment Checklist

- [ ] Privacy Policy hosted at production URL
- [ ] Terms of Service hosted at production URL
- [ ] Manifest.json contains correct privacy/terms URLs
- [ ] Frontend consent dialog tested in production build
- [ ] Backend API logs consent headers
- [ ] No console errors related to consent

### ✅ Step 14: Deploy

- [ ] Deploy frontend (Azure Static Web Apps)
- [ ] Deploy backend (Azure App Service)
- [ ] Verify URLs:
  - [ ] `https://revision.funcoding.nz/privacy` → Loads privacy policy
  - [ ] `https://revision.funcoding.nz/terms` → Loads terms
  - [ ] `https://revision.funcoding.nz/taskpane.html` → Add-in loads

### ✅ Step 15: Post-Deployment Validation

- [ ] Test consent flow in production environment
- [ ] Check Azure Application Insights → Logs show consent headers
- [ ] Verify privacy/terms links from production add-in

---

## Phase 8: AppSource Preparation (If submitting)

### ✅ Step 16: AppSource Requirements

- [ ] Privacy Policy URL added to AppSource submission form
- [ ] Terms of Service URL added to AppSource submission form
- [ ] App description mentions data processing clearly
- [ ] Screenshots show consent dialog (optional but recommended)
- [ ] Support documentation includes privacy information

### ✅ Step 17: Microsoft Validation Preparation

Prepare answers for reviewers:

- **Q: What data do you collect?**
  - A: Email content (for AI processing only), user email address (for rate limiting), usage statistics

- **Q: Where is data stored?**
  - A: Azure OpenAI (temporary processing), Azure Application Insights (logs for 30 days)

- **Q: Is data used for AI training?**
  - A: No, per Azure OpenAI terms (customer data is not used for training)

- **Q: How do users consent?**
  - A: Explicit consent dialog on first use, with links to privacy policy and terms

---

## ✅ Final Verification

### All Phases Complete?

- [ ] ✅ Privacy Policy created and hosted
- [ ] ✅ Terms of Service created and hosted
- [ ] ✅ Manifest updated with privacy/terms URLs
- [ ] ✅ Consent dialog implemented
- [ ] ✅ ConsentManager integrated into all API calls
- [ ] ✅ Settings panel has consent management
- [ ] ✅ Backend logs consent headers
- [ ] ✅ All tests passed
- [ ] ✅ Production deployment successful
- [ ] ✅ AppSource submission prepared (if applicable)

---

## 📞 Need Help?

- **Legal questions**: Consult a privacy lawyer
- **Technical issues**: Create GitHub issue
- **Microsoft certification**: Contact Microsoft Partner Support

---

## 📚 Reference Documents

- [Privacy & Consent Requirements](PRIVACY_AND_CONSENT.md) - Full legal guide
- [Consent Integration Example](../src/add-in/OutlookReVision/src/examples/consent-integration-example.ts) - Code examples
- [Microsoft Privacy Requirements](https://docs.microsoft.com/en-us/office/dev/add-ins/concepts/privacy-and-security)

---

**Estimated Total Time**: 12-18 hours (depending on experience)

**Last Updated**: October 19, 2025
