import * as React from "react";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../hooks/useSettings";
import { WRITING_TONES } from "../../types/settings";
import { getLanguageNameByCode } from "../../data/languages";

const useStyles = makeStyles({
  root: {
    margin: "8px 0",
    padding: "8px 12px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  settingsText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase200,
  },
});

const CurrentSettings: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation('currentSettings');
  const { settings } = useSettings();

  if (!settings) {
    return null;
  }

  return (
    <div className={styles.root}>
      <Text className={styles.settingsText}>
        {t('template', {
          emailLanguage: getLanguageNameByCode(settings.emailWritingLanguage),
          tone: WRITING_TONES[settings.writingTone as keyof typeof WRITING_TONES].toLowerCase(),
          nativeLanguage: getLanguageNameByCode(settings.nativeLanguage)
        })}
      </Text>
    </div>
  );
};

export default CurrentSettings;
