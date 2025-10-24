import * as React from "react";
import { 
  makeStyles, 
  Button, 
  Title1, 
  Field, 
  Combobox, 
  Option, 
  tokens,
  Text,
  Caption1,
  Link,
  Divider
} from "@fluentui/react-components";
import { ArrowLeft24Regular, Mail24Regular, Globe24Regular, Edit24Regular, LocalLanguage24Regular, Shield24Regular, Document24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../hooks/useSettings";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { LANGUAGES } from "../../data/languages";
import { WRITING_TONES } from "../../types/settings";
import { useToast, ToastType } from "../../hooks/useToast";

export interface SettingsProps {
  onBackClick?: () => void;
  autoSaveDefaults?: boolean;
}

const useStyles = makeStyles({
  container: {
    padding: "0",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "0px",
  },
  backButton: {
    minWidth: "auto",
  },
  content: {
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "4px",
    padding: "8px 12px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    borderLeft: `3px solid ${tokens.colorBrandBackground}`,
  },
  noteIcon: {
    color: tokens.colorBrandForeground1,
    marginTop: "1px",
    flexShrink: 0,
  },
  noteText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginTop: "0px",
    marginBottom: "0px",
  },
  legalSection: {
    marginTop: "30px",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  legalTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginBottom: "5px",
  },
  legalLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  legalLinkItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  legalIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
});

const Settings: React.FC<SettingsProps> = (props: SettingsProps) => {
  const { onBackClick, autoSaveDefaults } = props;
  const styles = useStyles();
  const { t } = useTranslation(['settings', 'writingTones']);
  const { settings, updateSetting, hasSettings, saveDefaultSettings } = useSettings();
  const { changeLanguage } = useLanguageSync();
  const { showToast } = useToast();

  // Auto-save defaults if this is first time and autoSaveDefaults is true
  React.useEffect(() => {
    if (autoSaveDefaults && !hasSettings) {
      // Save the current default settings (which include browser-detected language)
      saveDefaultSettings();
      showToast(ToastType.Success, "common:toasts.settingsSaved");
    }
  }, [autoSaveDefaults, hasSettings, saveDefaultSettings, showToast]);

  const handleEmailWritingLanguageChange = (_event: any, data: any) => {
    if (data?.optionValue) {
      updateSetting('emailWritingLanguage', data.optionValue);
      showToast(ToastType.Success, "common:toasts.settingsSaved");
    }
  };

  const handleNativeLanguageChange = (_event: any, data: any) => {
    if (data?.optionValue) {
      updateSetting('nativeLanguage', data.optionValue);
      showToast(ToastType.Success, "common:toasts.settingsSaved");
    }
  };

  const handleWritingToneChange = (_event: any, data: any) => {
    if (data?.optionValue) {
      updateSetting('writingTone', data.optionValue);
      showToast(ToastType.Success, "common:toasts.settingsSaved");
    }
  };

  const handleUILanguageChange = (_event: any, data: any) => {
    if (data?.optionValue) {
      updateSetting('uiLanguage', data.optionValue);
      // Immediately change the interface language using the full language code
      changeLanguage(data.optionValue);
      showToast(ToastType.Success, "common:toasts.settingsSaved");
    }
  };

  // Get display names for current selections
  const getCurrentEmailWritingLanguageName = () => {
    const lang = LANGUAGES.find(l => l.code === settings.emailWritingLanguage);
    return lang ? lang.name : settings.emailWritingLanguage;
  };

  const getCurrentNativeLanguageName = () => {
    const lang = LANGUAGES.find(l => l.code === settings.nativeLanguage);
    return lang ? lang.name : settings.nativeLanguage;
  };

  const getCurrentWritingToneName = () => {
    // Try to get translated tone name, fallback to English name from WRITING_TONES, then fallback to key
    const translatedName = t(`writingTones:${settings.writingTone}`);
    if (translatedName && translatedName !== `writingTones:${settings.writingTone}`) return translatedName;
    
    return WRITING_TONES[settings.writingTone as keyof typeof WRITING_TONES] || settings.writingTone;
  };

  const getCurrentUILanguageName = () => {
    const lang = LANGUAGES.find(l => l.code === settings.uiLanguage);
    return lang ? lang.name : settings.uiLanguage;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft24Regular />}
          className={styles.backButton}
          onClick={onBackClick}
          aria-label={t('common:back')}
        />
        <Title1>{t('title')}</Title1>
      </div>
      <div className={styles.content}>
        <Text className={styles.description}>
          {t('description')}
        </Text>

        <div className={styles.fieldGroup}>
          <Field label={t('emailWritingLanguage.label')}>
            <Combobox
              placeholder={t('emailWritingLanguage.placeholder')}
              value={getCurrentEmailWritingLanguageName()}
              onOptionSelect={handleEmailWritingLanguageChange}
            >
              {LANGUAGES.map((language) => (
                <Option key={language.code} value={language.code}>
                  {language.name}
                </Option>
              ))}
            </Combobox>
          </Field>
          <div className={styles.fieldNote}>
            <Mail24Regular className={styles.noteIcon} />
            <Caption1 className={styles.noteText}>
              {t('emailWritingLanguage.description')}
            </Caption1>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <Field label={t('nativeLanguage.label')}>
            <Combobox
              placeholder={t('nativeLanguage.placeholder')}
              value={getCurrentNativeLanguageName()}
              onOptionSelect={handleNativeLanguageChange}
            >
              {LANGUAGES.map((language) => (
                <Option key={language.code} value={language.code}>
                  {language.name}
                </Option>
              ))}
            </Combobox>
          </Field>
          <div className={styles.fieldNote}>
            <Globe24Regular className={styles.noteIcon} />
            <Caption1 className={styles.noteText}>
              {t('nativeLanguage.description')}
            </Caption1>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <Field label={t('uiLanguage.label')}>
            <Combobox
              placeholder={t('uiLanguage.placeholder')}
              value={getCurrentUILanguageName()}
              onOptionSelect={handleUILanguageChange}
            >
              {LANGUAGES.map((language) => (
                <Option key={language.code} value={language.code}>
                  {language.name}
                </Option>
              ))}
            </Combobox>
          </Field>
          <div className={styles.fieldNote}>
            <LocalLanguage24Regular className={styles.noteIcon} />
            <Caption1 className={styles.noteText}>
              {t('uiLanguage.description')}
            </Caption1>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <Field label={t('writingTone.label')}>
            <Combobox
              placeholder={t('writingTone.placeholder')}
              value={getCurrentWritingToneName()}
              onOptionSelect={handleWritingToneChange}
            >
              {Object.keys(WRITING_TONES).map((key) => {
                // Try to get translated tone name, fallback to English name
                const translatedName = t(`writingTones:${key}`);
                const displayName = (translatedName && translatedName !== `writingTones:${key}`) 
                  ? translatedName 
                  : WRITING_TONES[key as keyof typeof WRITING_TONES] || key;
                
                return (
                  <Option key={key} value={key}>
                    {displayName}
                  </Option>
                );
              })}
            </Combobox>
          </Field>
          <div className={styles.fieldNote}>
            <Edit24Regular className={styles.noteIcon} />
            <Caption1 className={styles.noteText}>
              {t('writingTone.description')}
            </Caption1>
          </div>
        </div>

        {!hasSettings && (
          <Text style={{ color: tokens.colorPaletteYellowForeground1, fontSize: tokens.fontSizeBase200 }}>
            ⚠️ {t('common:messages.noSettings')}
          </Text>
        )}

        <Divider />

        <div className={styles.legalSection}>
          <Text className={styles.legalTitle}>
            {t('legal.title')}
          </Text>
          <div className={styles.legalLinks}>
            <div className={styles.legalLinkItem}>
              <Shield24Regular className={styles.legalIcon} />
              <Link href="https://revision.funcoding.nz/assets/privacy.html" target="_blank">
                {t('legal.privacyPolicy')}
              </Link>
            </div>
            <div className={styles.legalLinkItem}>
              <Document24Regular className={styles.legalIcon} />
              <Link href="https://revision.funcoding.nz/assets/terms.html" target="_blank">
                {t('legal.termsOfService')}
              </Link>
            </div>
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3, marginTop: "5px" }}>
            {t('legal.description')}
          </Caption1>
        </div>
      </div>
    </div>
  );
};

export default Settings;
