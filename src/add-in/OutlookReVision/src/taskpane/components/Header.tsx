import * as React from "react";
import { Image, tokens, makeStyles, Button } from "@fluentui/react-components";
import { Settings24Regular, Comment24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";

export interface HeaderProps {
  title: string;
  logo: string;
  message: string;
  onSettingsClick?: () => void;
  onFeedbackClick?: () => void;
}

const useStyles = makeStyles({
  welcome__header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "15px",
    paddingTop: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
    backgroundColor: tokens.colorNeutralBackground3,
    gap: "15px",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  message: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  settingsButton: {
    minWidth: "auto",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  feedbackButton: {
    minWidth: "auto",
  },
});

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { title, logo, message, onSettingsClick, onFeedbackClick } = props;
  const styles = useStyles();
  const { t } = useTranslation(['common', 'feedback']);

  return (
    <section className={styles.welcome__header}>
      <div className={styles.leftSection}>
        <Image width="40" height="40" src={logo} alt={title} />
        <h1 className={styles.message}>{message}</h1>
      </div>
      <div className={styles.rightSection}>
        <Button
          appearance="subtle"
          icon={<Comment24Regular />}
          className={styles.feedbackButton}
          onClick={onFeedbackClick}
          aria-label={t('feedback:button')}
          title={t('feedback:button')}
        />
        <Button
          appearance="subtle"
          icon={<Settings24Regular />}
          className={styles.settingsButton}
          onClick={onSettingsClick}
          aria-label={t('common:settings')}
          title={t('common:settings')}
        />
      </div>
    </section>
  );
};

export default Header;


