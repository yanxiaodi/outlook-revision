/**
 * Example: How to integrate ConsentManager into your ReVision services
 * 
 * This shows how to check consent before making API calls to Azure OpenAI
 */

import { ConsentManager } from '../utils/ConsentManager';

/**
 * Wrapper function to ensure consent before API calls
 * Use this in your RealReVisionService
 */
export async function callWithConsent<T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'User has not consented to data processing'
): Promise<T> {
  // Check if user has granted consent
  if (!ConsentManager.hasConsent()) {
    throw new Error(errorMessage);
  }

  // Add consent headers to the request
  const consentHeaders = ConsentManager.getConsentHeaders();
  
  // Log consent status for audit trail
  console.log('API call authorized with consent:', {
    timestamp: new Date().toISOString(),
    consentHeaders,
  });

  // Proceed with the API call
  return apiCall();
}

/**
 * Example: Update RealReVisionService.ts to check consent
 * 
 * BEFORE (no consent check):
 * ----------------------------------------
 * async translate(text: string, targetLanguage: string): Promise<string> {
 *   const response = await fetch(`${API_URL}/api/Outlook/translate`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ text, targetLanguage }),
 *   });
 *   return response.json();
 * }
 * 
 * 
 * AFTER (with consent check):
 * ----------------------------------------
 * async translate(text: string, targetLanguage: string): Promise<string> {
 *   return callWithConsent(async () => {
 *     const consentHeaders = ConsentManager.getConsentHeaders();
 *     
 *     const response = await fetch(`${API_URL}/api/Outlook/translate`, {
 *       method: 'POST',
 *       headers: { 
 *         'Content-Type': 'application/json',
 *         ...consentHeaders, // Add consent tracking headers
 *       },
 *       body: JSON.stringify({ text, targetLanguage }),
 *     });
 *     
 *     if (!response.ok) {
 *       throw new Error(`Translation failed: ${response.statusText}`);
 *     }
 *     
 *     return response.json();
 *   }, 'Cannot translate: User has not consented to Azure OpenAI processing');
 * }
 */

/**
 * Example: Update your TaskPane component to show consent dialog
 * 
 * import { ConsentDialog, useConsent } from './components/consent/ConsentDialog';
 * 
 * export const TaskPane: React.FC = () => {
 *   const { hasConsent, showDialog, handleAccept, handleDecline } = useConsent();
 *   
 *   // Show consent dialog on first load
 *   return (
 *     <>
 *       <ConsentDialog 
 *         open={showDialog}
 *         onAccept={handleAccept}
 *         onDecline={handleDecline}
 *       />
 *       
 *       {hasConsent ? (
 *         // Show normal UI if user has consented
 *         <div>
 *           <TranslatePanel />
 *           <RevisePanel />
 *           <ComposePanel />
 *         </div>
 *       ) : (
 *         // Show message if user declined consent
 *         <div style={{ padding: '20px', textAlign: 'center' }}>
 *           <h3>Consent Required</h3>
 *           <p>You must accept the privacy policy to use AI features.</p>
 *           <Button onClick={() => window.location.reload()}>
 *             Review Consent
 *           </Button>
 *         </div>
 *       )}
 *     </>
 *   );
 * };
 */

/**
 * Example: Add consent management to Settings panel
 * 
 * import { ConsentManager } from '../utils/ConsentManager';
 * 
 * export const SettingsPanel: React.FC = () => {
 *   const [consentStatus, setConsentStatus] = React.useState(
 *     ConsentManager.getConsentStatus()
 *   );
 *   
 *   const handleRevokeConsent = () => {
 *     if (confirm('Are you sure you want to revoke consent? AI features will be disabled.')) {
 *       ConsentManager.revokeConsent();
 *       setConsentStatus(ConsentManager.getConsentStatus());
 *       alert('Consent revoked. Please reload the add-in.');
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <h3>Privacy & Data</h3>
 *       
 *       <div>
 *         <strong>Consent Status:</strong>{' '}
 *         {consentStatus.hasConsent ? (
 *           <span style={{ color: 'green' }}>✓ Granted</span>
 *         ) : (
 *           <span style={{ color: 'red' }}>✗ Not Granted</span>
 *         )}
 *       </div>
 *       
 *       {consentStatus.grantedAt && (
 *         <div>
 *           <strong>Granted on:</strong>{' '}
 *           {new Date(consentStatus.grantedAt).toLocaleString()}
 *         </div>
 *       )}
 *       
 *       <div>
 *         <strong>Policy Version:</strong> {consentStatus.storedVersion || 'N/A'}
 *       </div>
 *       
 *       {consentStatus.needsReConsent && (
 *         <div style={{ color: 'orange', marginTop: '10px' }}>
 *           ⚠️ Privacy policy has been updated. Please review and re-consent.
 *         </div>
 *       )}
 *       
 *       <div style={{ marginTop: '20px' }}>
 *         <Button onClick={handleRevokeConsent} appearance="secondary">
 *           Revoke Consent
 *         </Button>
 *       </div>
 *       
 *       <div style={{ marginTop: '10px' }}>
 *         <Link href={PRIVACY_POLICY_URL} target="_blank">
 *           View Privacy Policy
 *         </Link>
 *         {' | '}
 *         <Link href={TERMS_OF_SERVICE_URL} target="_blank">
 *           View Terms of Service
 *         </Link>
 *       </div>
 *     </div>
 *   );
 * };
 */

/**
 * Example: Backend API to track consent (optional but recommended)
 * 
 * Add this to your ASP.NET Core API to log consent for audit purposes
 * 
 * [HttpPost("api/consent/grant")]
 * public IActionResult GrantConsent([FromBody] ConsentRequest request)
 * {
 *     // Log consent for audit trail
 *     _logger.LogInformation(
 *         "User consent granted: Email={Email}, Version={Version}, Timestamp={Timestamp}",
 *         request.UserEmail,
 *         request.ConsentVersion,
 *         DateTime.UtcNow
 *     );
 *     
 *     // Optional: Store in database for compliance records
 *     // _consentRepository.SaveConsent(request);
 *     
 *     return Ok(new { success = true });
 * }
 * 
 * [HttpPost("api/consent/revoke")]
 * public IActionResult RevokeConsent([FromBody] ConsentRequest request)
 * {
 *     _logger.LogWarning(
 *         "User consent revoked: Email={Email}, Timestamp={Timestamp}",
 *         request.UserEmail,
 *         DateTime.UtcNow
 *     );
 *     
 *     // Optional: Mark consent as revoked in database
 *     // _consentRepository.RevokeConsent(request.UserEmail);
 *     
 *     return Ok(new { success = true });
 * }
 */

// Export for documentation
export default {
  message: `
    This file demonstrates how to integrate consent management into your add-in.
    
    Key steps:
    1. Import ConsentManager and ConsentDialog
    2. Check consent before all API calls using callWithConsent()
    3. Add consent headers to API requests
    4. Show ConsentDialog on first use
    5. Add consent management to Settings panel
    6. (Optional) Log consent events in backend API
    
    See inline code examples above.
  `,
};
