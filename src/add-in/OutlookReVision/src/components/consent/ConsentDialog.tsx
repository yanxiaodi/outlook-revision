/**
 * ConsentDialog Component
 * 
 * Displays a privacy consent dialog on first use of the add-in.
 * Required for GDPR/CCPA compliance before processing user email data.
 */

import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Link,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { 
  ConsentManager, 
  CONSENT_DIALOG_CONFIG,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '../../utils/ConsentManager';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  message: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    whiteSpace: 'pre-line',
  },
  highlight: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  links: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalS,
  },
  warning: {
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorPaletteYellowBackground2,
    borderLeft: `3px solid ${tokens.colorPaletteYellowBorder2}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
  },
});

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentDialog: React.FC<ConsentDialogProps> = ({
  open,
  onAccept,
  onDecline,
}) => {
  const styles = useStyles();

  const handleAccept = () => {
    try {
      // Store user consent
      ConsentManager.grantConsent();
      onAccept();
    } catch (error) {
      console.error('Failed to grant consent:', error);
      alert('Failed to save consent preference. Please try again.');
    }
  };

  const handleDecline = () => {
    ConsentManager.revokeConsent();
    onDecline();
  };

  return (
    <Dialog open={open} modalType="alert">
      <DialogSurface style={{ maxWidth: '500px' }}>
        <DialogBody>
          <DialogTitle>{CONSENT_DIALOG_CONFIG.title}</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {/* Main message with formatting preserved */}
            <div className={styles.message}>
              {CONSENT_DIALOG_CONFIG.message}
            </div>

            {/* Warning box */}
            <div className={styles.warning}>
              ⚠️ <strong>Required:</strong> You must accept to use AI features (translate, revise, compose).
            </div>

            {/* Privacy and Terms links */}
            <div className={styles.links}>
              <Link 
                href={PRIVACY_POLICY_URL} 
                target="_blank"
                rel="noopener noreferrer"
              >
                📄 Privacy Policy
              </Link>
              <Link 
                href={TERMS_OF_SERVICE_URL} 
                target="_blank"
                rel="noopener noreferrer"
              >
                📜 Terms of Service
              </Link>
            </div>
          </DialogContent>
          <DialogActions>
            <Button 
              appearance="secondary" 
              onClick={handleDecline}
            >
              {CONSENT_DIALOG_CONFIG.declineButton}
            </Button>
            <Button 
              appearance="primary" 
              onClick={handleAccept}
            >
              {CONSENT_DIALOG_CONFIG.acceptButton}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

/**
 * Hook to manage consent state in components
 */
export const useConsent = () => {
  const [hasConsent, setHasConsent] = React.useState(ConsentManager.hasConsent());
  const [showDialog, setShowDialog] = React.useState(!hasConsent);

  const checkConsent = React.useCallback(() => {
    const consent = ConsentManager.hasConsent();
    setHasConsent(consent);
    return consent;
  }, []);

  const handleAccept = React.useCallback(() => {
    setHasConsent(true);
    setShowDialog(false);
  }, []);

  const handleDecline = React.useCallback(() => {
    setHasConsent(false);
    setShowDialog(false);
    // Optionally show a message that AI features are disabled
  }, []);

  const revokeConsent = React.useCallback(() => {
    ConsentManager.revokeConsent();
    setHasConsent(false);
    setShowDialog(true);
  }, []);

  return {
    hasConsent,
    showDialog,
    checkConsent,
    handleAccept,
    handleDecline,
    revokeConsent,
  };
};
