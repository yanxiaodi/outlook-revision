import * as React from "react";
import {
  Dropdown,
  Option,
  OptionOnSelectData,
  SelectionEvents,
  makeStyles,
  tokens,
  useId,
} from "@fluentui/react-components";
import { SettingsContext } from "./App";

export interface Language {
  languageCode: string;
  displayName: string;
}
interface SettingsProps {
  languages: Language[];
  tones: string[];
}

export interface SettingsState {
  emailLanguage: string;
  userLanguage: string;
  writingTone: string;
}

const useStyles = makeStyles({
  settings__header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: "0px",
    paddingTop: "10px",
    backgroundColor: tokens.colorNeutralBackground3,
  },
  dropdown: {
    marginBottom: "20px",
  },
});

const Settings: React.FC<SettingsProps> = (props: SettingsProps) => {
  const { languages, tones } = props;
  const dropdownEmailLanguageId = useId("settings_email_language_label");
  const dropdownUserLanguageId = useId("settings_user_language_label");
  const dropdownWritingToneId = useId("settings_writing_tone_label");
  const styles = useStyles();

  const { settings, setSettings } = React.useContext(SettingsContext);

  const handleEmailLanguageDropdownChange = (_event: SelectionEvents, option?: OptionOnSelectData) => {
    if (option) {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, emailLanguage: option.optionValue };
        localStorage.setItem("settings", JSON.stringify(newSettings));
        return newSettings;
      });
    }
  };

  const handleUserLanguageDropdownChange = (_event: SelectionEvents, option?: OptionOnSelectData) => {
    if (option) {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, userLanguage: option.optionValue };
        localStorage.setItem("settings", JSON.stringify(newSettings));
        return newSettings;
      });
    }
  };

  const handleWritingToneDropdownChange = (_event: SelectionEvents, option?: OptionOnSelectData) => {
    if (option) {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, writingTone: option.optionValue };
        console.log(newSettings);

        localStorage.setItem("settings", JSON.stringify(newSettings));
        return newSettings;
      });
    }
  };

  return (
    <section className={styles.settings__header}>
      <h1>Settings</h1>
      <label id={dropdownEmailLanguageId} className="ms-Label">
        Email Language
      </label>
      <Dropdown
        className={styles.dropdown}
        aria-labelledby={dropdownEmailLanguageId}
        name="emailLanguage"
        {...props}
        onOptionSelect={handleEmailLanguageDropdownChange}
        defaultValue={languages.find((x) => x.languageCode == settings.emailLanguage)?.displayName ?? languages[0].displayName}
      >
        {languages.map((option) => (
          <Option key={option.languageCode} value={option.languageCode}>
            {option.displayName}
          </Option>
        ))}
      </Dropdown>
      <label id={dropdownUserLanguageId} className="ms-Label">
        User Language
      </label>
      <Dropdown
        className={styles.dropdown}
        aria-labelledby={dropdownUserLanguageId}
        name="userLanguage"
        {...props}
        onOptionSelect={handleUserLanguageDropdownChange}
        defaultValue={languages.find((x) => x.languageCode == settings.userLanguage)?.displayName ?? languages[0].displayName}
      >
        {languages.map((option) => (
          <Option key={option.languageCode} value={option.languageCode}>
            {option.displayName}
          </Option>
        ))}
      </Dropdown>
      <label id={dropdownWritingToneId} className="ms-Label">
        Writing Tone
      </label>
      <Dropdown
        className={styles.dropdown}
        aria-labelledby={dropdownWritingToneId}
        name="writingTone"
        {...props}
        onOptionSelect={handleWritingToneDropdownChange}
        defaultValue={settings.writingTone ?? tones[0]}
      >
        {tones.map((option) => (
          <Option key={option}>{option}</Option>
        ))}
      </Dropdown>
    </section>
  );
};

export default Settings;
