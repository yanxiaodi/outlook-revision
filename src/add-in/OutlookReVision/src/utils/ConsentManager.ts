/**
 * ConsentManager - Handles user consent for data processing
 * 
 * LEGAL REQUIREMENT: Users must explicitly consent before their email
 * content is sent to Azure OpenAI for processing.
 * 
 * Compliance: GDPR, CCPA, PIPEDA, Privacy Act 2020
 */

const CONSENT_STORAGE_KEY = 'outlookrevision_user_consent';
const CONSENT_VERSION = '1.0'; // Increment when privacy policy changes

export interface ConsentData {
  granted: boolean;
  version: string;
  timestamp: string;
  userEmail?: string;
}

export class ConsentManager {
  /**
   * Check if user has granted consent for current privacy policy version
   */
  static hasConsent(): boolean {
    const consent = this.getConsentData();
    return consent !== null && 
           consent.granted && 
           consent.version === CONSENT_VERSION;
  }

  /**
   * Get stored consent data
   */
  static getConsentData(): ConsentData | null {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as ConsentData;
    } catch (error) {
      console.error('Failed to read consent data:', error);
      return null;
    }
  }

  /**
   * Grant consent for data processing
   */
  static grantConsent(userEmail?: string): void {
    const consentData: ConsentData = {
      granted: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      userEmail,
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
      console.log('User consent granted:', consentData);
    } catch (error) {
      console.error('Failed to store consent data:', error);
      throw new Error('Failed to save consent preference');
    }
  }

  /**
   * Revoke consent (user opts out)
   */
  static revokeConsent(): void {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      console.log('User consent revoked');
    } catch (error) {
      console.error('Failed to revoke consent:', error);
    }
  }

  /**
   * Get consent status details for debugging/admin
   */
  static getConsentStatus(): {
    hasConsent: boolean;
    currentVersion: string;
    storedVersion?: string;
    grantedAt?: string;
    needsReConsent: boolean;
  } {
    const consent = this.getConsentData();
    const hasConsent = this.hasConsent();

    return {
      hasConsent,
      currentVersion: CONSENT_VERSION,
      storedVersion: consent?.version,
      grantedAt: consent?.timestamp,
      needsReConsent: consent !== null && consent.version !== CONSENT_VERSION,
    };
  }

  /**
   * Add consent headers to API requests (for audit trail)
   */
  static getConsentHeaders(): Record<string, string> {
    const consent = this.getConsentData();
    
    if (!consent || !consent.granted) {
      return {
        'X-User-Consented': 'false',
      };
    }

    return {
      'X-User-Consented': 'true',
      'X-Consent-Version': consent.version,
      'X-Consent-Date': consent.timestamp,
    };
  }
}

/**
 * Privacy Policy and Terms URLs
 * These files are served from the assets directory
 */
export const PRIVACY_POLICY_URL = 'https://revision.funcoding.nz/assets/privacy.html';
export const TERMS_OF_SERVICE_URL = 'https://revision.funcoding.nz/assets/terms.html';

/**
 * Consent dialog content
 */
export const CONSENT_DIALOG_CONFIG = {
  title: 'Privacy Consent Required',
  message: `
OutlookReVision uses Azure OpenAI to help you compose, translate, and revise emails.

**What data is processed:**
• Email content you choose to translate/revise
• Your email address (for rate limiting)
• Basic usage statistics

**Important information:**
• Data is sent to Microsoft Azure OpenAI
• Your data is NOT used to train AI models
• Email content is NOT permanently stored
• You can revoke consent at any time in Settings

By clicking "Accept", you agree to our Privacy Policy and Terms of Service.
  `.trim(),
  acceptButton: 'Accept and Continue',
  declineButton: 'Decline',
  links: {
    privacy: PRIVACY_POLICY_URL,
    terms: TERMS_OF_SERVICE_URL,
  },
};
