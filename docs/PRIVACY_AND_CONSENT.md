# Privacy Policy & User Consent Requirements

## ⚠️ Legal Compliance Overview

**CRITICAL**: This add-in processes user email content through Azure OpenAI, which constitutes processing of potentially sensitive personal data. You **must** implement proper consent mechanisms and privacy disclosures to comply with:

- **GDPR** (General Data Protection Regulation - EU)
- **CCPA** (California Consumer Privacy Act - US)
- **PIPEDA** (Personal Information Protection and Electronic Documents Act - Canada)
- **Privacy Act 2020** (New Zealand)
- **Microsoft 365 App Compliance Program**
- **AppSource Certification Requirements**

---

## 🚨 Current Legal Gaps

### What's Missing:
1. ❌ **No user consent mechanism** before sending data to Azure OpenAI
2. ❌ **No privacy policy** disclosure
3. ❌ **No data processing agreement** visibility
4. ❌ **No opt-out mechanism**
5. ❌ **No data retention policy**
6. ❌ **No data deletion mechanism**

### Legal Risks:
- **GDPR violations**: Fines up to €20 million or 4% of annual revenue
- **CCPA violations**: Up to $7,500 per intentional violation
- **Microsoft certification rejection**: App won't be approved for AppSource
- **User trust issues**: Loss of credibility and adoption

---

## 📋 Required Legal Documents

### 1. Privacy Policy (REQUIRED)

**Location**: Must be publicly accessible (e.g., `https://revision.funcoding.nz/privacy`)

**Must Include**:
- What data is collected (email content, metadata, user email address)
- How data is processed (sent to Azure OpenAI for translation/revision)
- Where data is stored (Azure region, retention period)
- Who has access to data (your organization, Microsoft Azure)
- User rights (access, deletion, opt-out)
- Data security measures
- Contact information for privacy inquiries
- Last updated date

**Template**: See [PRIVACY_POLICY_TEMPLATE.md](#privacy-policy-template) below

---

### 2. Terms of Service (REQUIRED)

**Location**: Must be publicly accessible (e.g., `https://revision.funcoding.nz/terms`)

**Must Include**:
- Acceptable use policy
- Service limitations and disclaimers
- Intellectual property rights
- Limitation of liability
- Termination conditions
- Governing law and jurisdiction

**Template**: See [TERMS_OF_SERVICE_TEMPLATE.md](#terms-of-service-template) below

---

### 3. Data Processing Agreement (RECOMMENDED)

**For Enterprise Customers**: If selling to businesses, they may require a separate DPA

**Must Include**:
- Data processor obligations (your responsibilities)
- Sub-processor disclosure (Azure OpenAI as sub-processor)
- Data security measures
- Data breach notification procedures
- Data subject rights handling
- Audit rights

---

## 🛡️ Implementation Requirements

### 1. First-Run Consent Dialog

**When**: Before the add-in makes its first API call

**Implementation**: 
```typescript
// Example: Show consent dialog on first use
if (!hasUserConsented()) {
  showConsentDialog({
    title: "Privacy Consent Required",
    message: `
      OutlookReVision uses Azure OpenAI to process your email content.
      
      By using this add-in:
      • Your email content will be sent to Microsoft Azure OpenAI
      • Data is processed in: [Azure Region]
      • Data is not stored permanently
      • No data is used for AI training (per Azure OpenAI terms)
      
      [View Privacy Policy] [View Terms of Service]
    `,
    buttons: ["Accept", "Decline"]
  });
}
```

**Must Include**:
- ✅ Clear explanation of data processing
- ✅ Links to full Privacy Policy and Terms
- ✅ Explicit "Accept" action (not pre-checked)
- ✅ "Decline" option (disables add-in)
- ✅ Option to revoke consent later

---

### 2. Settings Panel Consent Management

**Location**: Add-in settings UI

**Features**:
```typescript
// Settings panel checkboxes
- [ ] I consent to Azure OpenAI processing my emails
- [ ] I agree to send usage analytics (optional)

[Revoke Consent] - Disables all AI features
[View Privacy Policy]
[View Terms of Service]
[Delete My Data] - Requests data deletion
```

---

### 3. Manifest Updates

**Add Privacy and Terms URLs** to `manifest.json`:

```json
{
  "authorization": {
    "permissions": {
      "resourceSpecific": [
        {
          "name": "MailboxItem.ReadWrite.User",
          "type": "Delegated"
        }
      ]
    }
  },
  "privacyUrl": "https://revision.funcoding.nz/privacy",
  "termsOfUseUrl": "https://revision.funcoding.nz/terms"
}
```

---

### 4. API Request Headers

**Add transparency headers** to all Azure OpenAI requests:

```typescript
// Example: Add user consent tracking
fetch('/api/Outlook/translate', {
  headers: {
    'X-User-Consented': 'true',
    'X-Consent-Version': '1.0',
    'X-Consent-Date': '2025-01-15T10:30:00Z'
  }
});
```

---

## 📄 Privacy Policy Template

Create: `docs/PRIVACY_POLICY.md` (and host at `https://revision.funcoding.nz/privacy`)

```markdown
# Privacy Policy for OutlookReVision

**Last Updated**: [DATE]

## 1. Introduction

OutlookReVision ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Outlook add-in.

## 2. Information We Collect

### 2.1 Email Content
When you use our AI-powered features (translate, revise, compose), we temporarily process:
- Email subject lines
- Email body text
- Recipient information (only for context, not stored)

### 2.2 User Information
- Your email address (for rate limiting and logging)
- Outlook version and language settings
- Add-in usage statistics (feature usage counts)

### 2.3 Technical Data
- IP address (for security and rate limiting)
- Browser/Outlook client version
- Error logs and performance metrics

## 3. How We Use Your Information

### 3.1 Primary Purpose
- **AI Processing**: Email content is sent to Azure OpenAI API for translation, revision, or composition
- **Rate Limiting**: Email addresses are used to prevent abuse (50 requests per day per user)

### 3.2 Service Improvement
- Aggregate usage statistics to improve features
- Error logs to diagnose and fix issues
- Performance metrics to optimize response times

## 4. Data Processing and Storage

### 4.1 Azure OpenAI Processing
- **Provider**: Microsoft Azure OpenAI Service
- **Region**: [YOUR AZURE REGION, e.g., Australia East]
- **Retention**: Email content is **not stored** by Azure OpenAI (per Microsoft's Data Processing Agreement)
- **Training**: Your data is **not used** to train AI models (per Azure OpenAI terms)

### 4.2 Our Storage
- **Logs**: User email addresses in logs are retained for 30 days
- **Cache**: Rate limiting data (email + request count) cached for 1 minute
- **Analytics**: Aggregate statistics (no personal data) retained for 1 year

### 4.3 Data Location
- API Server: Azure App Service ([REGION])
- Database: None (no permanent data storage)
- Logs: Azure Application Insights ([REGION])

## 5. Data Sharing

We **do not sell** your data. We share data only with:

### 5.1 Service Providers
- **Microsoft Azure**: For cloud hosting and AI processing (covered by Microsoft's DPA)

### 5.2 Legal Requirements
We may disclose your information if required by law or to:
- Comply with legal processes
- Enforce our Terms of Service
- Protect our rights or safety

## 6. Your Rights

Under GDPR, CCPA, and other privacy laws, you have the right to:

### 6.1 Access
Request a copy of data we hold about you (email us at [CONTACT EMAIL])

### 6.2 Deletion
Request deletion of your data:
- Logs: Deleted within 30 days of request
- Cache: Automatically expires after 1 minute

### 6.3 Opt-Out
- Revoke consent in add-in settings (disables AI features)
- Uninstall the add-in to stop all data processing

### 6.4 Portability
Request your data in a portable format (email us at [CONTACT EMAIL])

## 7. Data Security

### 7.1 In Transit
- All data transmitted via HTTPS/TLS 1.2+
- API authentication via Azure-managed keys

### 7.2 At Rest
- Logs encrypted in Azure Application Insights
- No permanent email content storage

### 7.3 Access Control
- Production API access restricted to authorized personnel
- Azure RBAC controls in place

## 8. Data Retention

| Data Type | Retention Period | Purpose |
|-----------|------------------|---------|
| Email content | Not stored | Temporary processing only |
| User email (logs) | 30 days | Debugging and monitoring |
| Rate limit cache | 1 minute | Abuse prevention |
| Error logs | 30 days | Issue resolution |
| Usage statistics | 1 year (anonymized) | Service improvement |

## 9. Children's Privacy

This add-in is not intended for users under 16. We do not knowingly collect data from children.

## 10. International Data Transfers

If you're outside [YOUR COUNTRY], your data may be transferred to and processed in [AZURE REGION]. We rely on:
- Microsoft's Standard Contractual Clauses (SCCs)
- Azure's GDPR compliance certifications

## 11. Changes to This Policy

We may update this policy periodically. We will notify you of material changes via:
- In-add-in notification
- Email to registered users
- Updated "Last Updated" date

## 12. Contact Us

For privacy inquiries, data requests, or concerns:

- **Email**: [YOUR CONTACT EMAIL]
- **Website**: https://revision.funcoding.nz
- **Data Protection Officer**: [NAME/EMAIL] (if applicable)

## 13. Regulatory Information

**Data Controller**: [YOUR ORGANIZATION NAME]  
**Address**: [YOUR BUSINESS ADDRESS]  
**Registration**: [GDPR REGISTRATION NUMBER] (if in EU)

---

**Microsoft Azure Sub-Processor**:
- Azure OpenAI Service (Microsoft Corporation)
- Privacy Policy: https://privacy.microsoft.com/en-us/privacystatement
- DPA: https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA
```

---

## 📄 Terms of Service Template

Create: `docs/TERMS_OF_SERVICE.md` (and host at `https://revision.funcoding.nz/terms`)

```markdown
# Terms of Service for OutlookReVision

**Last Updated**: [DATE]

## 1. Acceptance of Terms

By installing and using OutlookReVision ("the Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.

## 2. Description of Service

OutlookReVision is an Outlook add-in that provides:
- AI-powered email translation (38 languages)
- Email composition assistance
- Email revision and improvement suggestions

**Powered by**: Azure OpenAI Service

## 3. User Obligations

### 3.1 Acceptable Use
You agree to:
- ✅ Use the Service for lawful purposes only
- ✅ Comply with Microsoft 365 Terms of Service
- ✅ Respect rate limits (50 requests per day)

You agree **not** to:
- ❌ Abuse or overload the Service
- ❌ Attempt to reverse-engineer the add-in
- ❌ Use the Service to process illegal content
- ❌ Share your account credentials
- ❌ Circumvent rate limiting mechanisms

### 3.2 Prohibited Content
Do not use the Service to process:
- Illegal content (child abuse, terrorism, etc.)
- Spam or unsolicited bulk email
- Malware or malicious code
- Content that violates third-party rights

## 4. Service Availability

### 4.1 Uptime
- We strive for 99% uptime, but do not guarantee uninterrupted service
- Scheduled maintenance may cause temporary outages

### 4.2 Rate Limits
- Standard tier: 50 requests per day per user (resets at midnight UTC)
- Excessive use may result in temporary throttling

### 4.3 Service Changes
We reserve the right to:
- Modify features or functionality
- Suspend service for maintenance
- Discontinue the Service with 30 days' notice

## 5. Intellectual Property

### 5.1 Ownership
- **Add-in Code**: © [YEAR] [YOUR ORGANIZATION] - All rights reserved
- **Generated Content**: You retain ownership of AI-generated email content

### 5.2 Licenses
- We grant you a non-exclusive, non-transferable license to use the Service
- Microsoft retains ownership of Outlook and Azure OpenAI

## 6. Data and Privacy

### 6.1 Data Processing
By using the Service, you consent to:
- Email content being sent to Azure OpenAI for processing
- User email addresses being logged for rate limiting
- See our [Privacy Policy](PRIVACY_POLICY.md) for details

### 6.2 Data Security
- We implement industry-standard security measures
- However, no method of transmission is 100% secure
- You use the Service at your own risk

## 7. Disclaimer of Warranties

### 7.1 "AS IS" Basis
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING:
- Merchantability
- Fitness for a particular purpose
- Non-infringement
- Accuracy of AI-generated content

### 7.2 AI Content Accuracy
- AI translations/revisions may contain errors
- You are responsible for reviewing and verifying all generated content
- We are not liable for inaccuracies in AI-generated text

## 8. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

### 8.1 Exclusion of Damages
We are **not** liable for:
- Indirect, incidental, or consequential damages
- Lost profits or business opportunities
- Data loss or corruption
- Service interruptions or outages

### 8.2 Liability Cap
Our total liability shall not exceed:
- $100 USD or
- Amount you paid for the Service in the last 12 months (whichever is greater)

## 9. Indemnification

You agree to indemnify and hold us harmless from claims arising from:
- Your violation of these Terms
- Your misuse of the Service
- Content you process through the Service

## 10. Termination

### 10.1 By You
- Uninstall the add-in at any time
- Request data deletion per our Privacy Policy

### 10.2 By Us
We may suspend/terminate your access if you:
- Violate these Terms
- Abuse the Service (excessive requests, etc.)
- Engage in fraudulent or illegal activity

## 11. Governing Law

### 11.1 Jurisdiction
These Terms are governed by the laws of [YOUR COUNTRY/STATE]

### 11.2 Dispute Resolution
- **Informal Resolution**: Contact us first at [CONTACT EMAIL]
- **Arbitration**: Disputes shall be resolved by binding arbitration
- **Exceptions**: Either party may seek injunctive relief in court

## 12. Changes to Terms

We may modify these Terms at any time:
- Material changes will be notified via email or in-add-in notification
- Continued use after changes constitutes acceptance
- Check "Last Updated" date for changes

## 13. Severability

If any provision is found unenforceable, the remaining provisions remain in effect.

## 14. Contact Information

For questions about these Terms:

- **Email**: [YOUR CONTACT EMAIL]
- **Website**: https://revision.funcoding.nz
- **Business Address**: [YOUR ADDRESS]

---

**Microsoft Azure Services**:
This Service uses Microsoft Azure OpenAI, which is subject to Microsoft's terms:
- Azure OpenAI Terms: https://azure.microsoft.com/en-us/support/legal/
- Microsoft Product Terms: https://www.microsoft.com/licensing/terms/

**Last Updated**: [DATE]
```

---

## ✅ Implementation Checklist

### Phase 1: Immediate (Before Any Production Use)
- [ ] Create Privacy Policy document
- [ ] Create Terms of Service document
- [ ] Host both documents on public URLs
- [ ] Update `manifest.json` with privacy/terms URLs
- [ ] Add first-run consent dialog to add-in
- [ ] Add consent checkbox before first API call
- [ ] Store user consent preference (localStorage)

### Phase 2: Enhanced Compliance (Before AppSource Submission)
- [ ] Add Settings panel with consent management
- [ ] Implement "Revoke Consent" functionality
- [ ] Add "Delete My Data" request mechanism
- [ ] Create data retention policy in backend
- [ ] Implement automatic log deletion (30 days)
- [ ] Add consent version tracking
- [ ] Create GDPR data export functionality

### Phase 3: Enterprise Features (Optional)
- [ ] Create separate Data Processing Agreement (DPA)
- [ ] Implement admin consent for organization deployment
- [ ] Add audit logging for compliance teams
- [ ] Create SOC 2 / ISO 27001 compliance documentation
- [ ] Implement data residency options (multi-region)

---

## 🔍 AppSource Certification Requirements

### Microsoft's Privacy Requirements:
1. ✅ **Privacy Policy URL** in manifest (REQUIRED)
2. ✅ **Terms of Service URL** in manifest (REQUIRED)
3. ✅ **Data usage disclosure** in AppSource listing (REQUIRED)
4. ✅ **No surprise data collection** - disclose upfront (REQUIRED)
5. ✅ **User consent** before first data transmission (REQUIRED)

### Validation Documentation:
- Microsoft will review your privacy policy during certification
- You may be asked to demonstrate consent flow
- Expect questions about Azure OpenAI data handling

---

## 📞 Support and Legal Contacts

### For Privacy Inquiries:
Set up a dedicated email: `privacy@funcoding.nz` or similar

### For Legal Compliance:
Consider consulting:
- **Privacy lawyer** (GDPR/CCPA compliance review)
- **Microsoft Partner** (AppSource certification guidance)
- **Azure compliance team** (Data residency questions)

---

## 📚 Additional Resources

### Official Documentation:
- [Microsoft Privacy Requirements for Office Add-ins](https://docs.microsoft.com/en-us/office/dev/add-ins/concepts/privacy-and-security)
- [AppSource Validation Policies](https://docs.microsoft.com/en-us/legal/marketplace/certification-policies)
- [Azure OpenAI Data Privacy](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy)
- [GDPR Compliance Guide](https://gdpr.eu/compliance/)

### Templates and Tools:
- [Termly Privacy Policy Generator](https://termly.io/products/privacy-policy-generator/)
- [GDPR Consent Examples](https://gdpr.eu/consent-examples/)
- [Microsoft Compliance Manager](https://compliance.microsoft.com/)

---

## ⚠️ Final Warning

**DO NOT deploy to production or submit to AppSource without:**
1. ✅ Valid Privacy Policy
2. ✅ Valid Terms of Service  
3. ✅ User consent mechanism
4. ✅ Opt-out functionality
5. ✅ Data deletion process

**Legal non-compliance can result in:**
- ❌ AppSource rejection
- ❌ Regulatory fines
- ❌ User lawsuits
- ❌ Reputational damage
- ❌ Microsoft Partner Program suspension

---

**Last Updated**: October 19, 2025  
**Document Version**: 1.0
